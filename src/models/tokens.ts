import {makeAutoObservable, runInAction, when} from 'mobx';
import {makePersistable} from 'mobx-persist-store';

import {app} from '@app/contexts';
import {AddressUtils, NATIVE_TOKEN_ADDRESS} from '@app/helpers/address-utils';
import {Whitelist} from '@app/helpers/whitelist';
import {Contracts} from '@app/models/contracts';
import {Socket} from '@app/models/socket';
import {IWalletModel, Wallet} from '@app/models/wallet';
import {Balance} from '@app/services/balance';
import {Indexer} from '@app/services/indexer';
import {storage} from '@app/services/mmkv';
import {
  AddressCosmos,
  AddressEthereum,
  AddressType,
  IContract,
  IToken,
  IndexerToken,
  IndexerTokensData,
  MobXStore,
} from '@app/types';
import {RPCMessage} from '@app/types/rpc';
import {createAsyncTask} from '@app/utils';

import {Provider, ProviderModel} from './provider';

class TokensStore implements MobXStore<IToken> {
  /**
   * All tokens available for all wallets with commulative value
   * @key Token contract address
   * @value IToken
   */
  data: Record<string, IToken> = {};
  /**
   * Indexer response with token info
   * @key Wallet address
   * @value Array of tokens for this wallet address
   */
  tokens: IndexerTokensData = {};
  private lastUpdate = new Date(0);
  private _isLoading = false;

  constructor(shouldSkipPersisting: boolean = false) {
    makeAutoObservable(this);
    if (!shouldSkipPersisting) {
      makePersistable(this, {
        name: this.constructor.name,
        properties: [
          // https://github.com/quarrant/mobx-persist-store/issues/97
          // @ts-ignore
          'contracts',
          {
            key: 'tokens',
            deserialize: (stringObject: string): this['tokens'] => {
              const value = JSON.parse(stringObject) as this['tokens'];
              const keys = Object.keys(value);
              const newValue = keys.reduce((prev, cur) => {
                return {
                  ...prev,
                  [AddressUtils.toEth(cur)]: value[AddressUtils.toEth(cur)].map(
                    item => ({
                      ...item,
                      value: Balance.fromJsonString(item.value),
                    }),
                  ),
                };
              }, {});

              return newValue;
            },
            // @ts-ignore
            serialize: (value: this['tokens']) => {
              const keys = Object.keys(value);
              const newValue = keys.reduce((prev, cur) => {
                return {
                  ...prev,
                  [AddressUtils.toEth(cur)]: value[AddressUtils.toEth(cur)].map(
                    item => ({
                      ...item,
                      value: item.value.toJsonString(),
                    }),
                  ),
                };
              }, {});

              return JSON.stringify(newValue);
            },
          },
        ],
        storage: storage,
      }).then(() => {
        // Logger.log('TokensStore data', JSON.stringify(this.data, null, 2));
      });
    }

    when(
      () => Socket.lastMessage.type === 'token',
      () => this.onMessage(Socket.lastMessage),
    );
  }

  get isLoading() {
    return this._isLoading;
  }

  get UNKNOWN_TOKEN() {
    return {
      name: 'UNKNOWN',
      symbol: '?',
      icon: require('@assets/images/empty-icon.png'),
      decimals: 0,
      contract_address: '',
    };
  }
  create(id: string, params: IToken) {
    const existingItem = this.getById(params.id);

    if (existingItem) {
      this.update(existingItem.id, params);
    } else {
      this.data = {
        ...this.data,
        [AddressUtils.toEth(id)]: params,
      };
    }

    return id;
  }

  remove(id: string | undefined) {
    if (!id) {
      return false;
    }
    const itemToRemove = this.getById(id);
    if (!itemToRemove) {
      return false;
    }
    const newData = {
      ...this.data,
    };
    delete newData[AddressUtils.toEth(id)];

    this.data = newData;
    return true;
  }

  removeAll() {
    this.data = {};
  }

  getAll() {
    return Object.values(this.data);
  }

  getByAddress(address?: string) {
    try {
      if (!address) {
        return null;
      }
      return this.getAll()?.find(t => AddressUtils.equals(address, t.id));
    } catch {
      return null;
    }
  }

  getAllVisible() {
    return this.getAll().filter(item => !!item.is_in_white_list);
  }

  getAllPositive() {
    return this.getAll().filter(
      item => !!item.is_in_white_list && item.value.isPositive(),
    );
  }

  getById(id: string) {
    const token = this.data[AddressUtils.toEth(id)];

    if (!token) {
      return Object.values(this.tokens)
        .flat()
        .find(t => t.id === id);
    }
    return token;
  }

  update(id: string | undefined, item: Omit<IToken, 'id'>) {
    if (!id) {
      return false;
    }
    const itemToUpdate = this.getById(id);
    if (!itemToUpdate) {
      return false;
    }

    const updatedValue = itemToUpdate.value.operate(item.value, 'add');

    this.data = {
      ...this.data,
      [AddressUtils.toEth(id)]: {
        ...itemToUpdate,
        ...item,
        value: updatedValue,
      },
    };
    return true;
  }

  fetchTokens = createAsyncTask(async (force = true) => {
    if (this.isLoading && !force) {
      return;
    }

    runInAction(() => {
      this._isLoading = true;
      this.tokens = {};
    });

    const wallets = Wallet.getAll();
    const accounts = wallets.map(w => w.cosmosAddress);
    const updates = await Indexer.instance.updates(accounts, this.lastUpdate);

    const addressesMap = new Map(
      updates.addresses.map(address => [
        AddressUtils.toEth(address.id),
        address,
      ]),
    );

    const _tokens = {} as Record<AddressEthereum, IToken[]>;
    const _data = {} as Record<AddressEthereum, IToken>;

    wallets.forEach(wallet => {
      _tokens[AddressUtils.toEth(wallet.cosmosAddress)] = [
        ...this.generateNativeTokens(wallet),
      ];
    });
    for await (const t of updates.tokens) {
      try {
        const isPositive = new Balance(t.value).isPositive();
        if (!isPositive) {
          continue;
        }

        const contractAddress = AddressUtils.toEth(t.contract);
        const contract =
          addressesMap.get(contractAddress) ||
          this.getContract(contractAddress) ||
          (await Whitelist.verifyAddress(
            contractAddress,
            Provider.getByEthChainId(t.chain_id),
          ));

        if (!contract) {
          Logger.error(
            'TokensStore.fetchTokens',
            `contract for token ${t.contract} not found`,
          );
          continue;
        }

        const token: IToken = {
          id: contract.id,
          contract_created_at: contract.created_at,
          contract_updated_at: contract.updated_at,
          value: new Balance(
            t.value,
            contract.decimals ?? Provider.selectedProvider.decimals,
            contract.symbol ?? Provider.selectedProvider.denom,
          ),
          decimals: contract.decimals,
          is_erc20: contract.is_erc20,
          is_erc721: contract.is_erc721,
          is_erc1155: contract.is_erc1155,
          is_in_white_list: contract.is_in_white_list,
          name: contract.name,
          symbol: contract.symbol,
          created_at: t.created_at,
          updated_at: t.updated_at,
          chain_id: t.chain_id,
          image: contract.icon
            ? {uri: contract.icon}
            : require('@assets/images/empty-icon.png'),
        };

        const walletAddress = AddressUtils.toEth(t.address);

        if (!_tokens[walletAddress]?.length) {
          _tokens[walletAddress] = [
            ...this.generateNativeTokens(Wallet.getById(walletAddress)!),
          ];
        }

        _tokens[walletAddress].push(token);
        _data[AddressUtils.toEth(token.id)] = token;
      } catch (e) {
        Logger.error(
          'TokensStore.fetchTokens',
          `error durning parsing tokens ${e}`,
        );
      }
    }
    runInAction(() => {
      this.tokens = _tokens;
      this.data = {
        ...this.data,
        ..._data,
      };
      this._isLoading = false;
    });
  });

  private generateNativeTokens = (w: IWalletModel) => {
    if (Provider.isAllNetworks) {
      return Provider.getAllNetworks().map(p => this.generateNativeToken(w, p));
    }

    return [this.generateNativeToken(w)];
  };

  public generateNativeToken = (
    wallet: IWalletModel,
    provider: ProviderModel = Provider.selectedProvider,
  ): IToken => {
    const balance = app.getAvailableBalance(wallet.address, provider);

    return {
      id: AddressUtils.toHaqq(NATIVE_TOKEN_ADDRESS),
      contract_created_at: '',
      contract_updated_at: '',
      value: balance,
      decimals: provider.decimals,
      is_erc20: false,
      is_erc721: false,
      is_erc1155: false,
      is_in_white_list: true,
      name: provider.coinName,
      symbol: provider.denom,
      created_at: '',
      updated_at: '',
      chain_id: provider.ethChainId,
      image: provider.isHaqqNetwork
        ? require('@assets/images/islm_icon.png')
        : {uri: provider.icon},
    };
  };

  public generateNativeTokenContracts = () => {
    if (Provider.isAllNetworks) {
      return Provider.getAllNetworks().map(p =>
        this.generateNativeTokenContract(p),
      );
    }

    return [this.generateNativeTokenContract()];
  };

  public generateNativeTokenContract = (
    provider: ProviderModel = Provider.selectedProvider,
  ): IContract => {
    return {
      id: AddressUtils.toHaqq(NATIVE_TOKEN_ADDRESS),
      eth_address: AddressUtils.toEth(NATIVE_TOKEN_ADDRESS),
      address_type: AddressType.contract,
      is_skip_eth_tx: false,
      min_input_amount: '18',
      decimals: provider.decimals,
      is_erc20: false,
      is_erc721: false,
      is_erc1155: false,
      is_in_white_list: true,
      name: provider.coinName,
      symbol: provider.denom,
      created_at: '',
      updated_at: '',
      icon: provider.isHaqqNetwork
        ? require('@assets/images/islm_icon.png')
        : provider.icon,
    };
  };

  private getTokenContract = async (
    token: IndexerToken,
  ): Promise<IContract> => {
    try {
      const contract = await Whitelist.verifyAddress(
        token.contract,
        Provider.getByEthChainId(token.chain_id),
      );
      return (contract || {}) as IContract;
    } catch (e) {
      return {} as IContract;
    }
  };

  private parseIToken = async (token: IndexerToken) => {
    const contract = await this.getTokenContract(token);
    this.saveContract(contract);

    const contractFromCache = this.getContract(token.contract);

    const result: IToken = {
      id: AddressUtils.toHaqq(contractFromCache.id),
      contract_created_at: contractFromCache.created_at,
      contract_updated_at: contractFromCache.updated_at,
      value: new Balance(
        token.value,
        contractFromCache.decimals || Provider.selectedProvider.decimals,
        contractFromCache.symbol || Provider.selectedProvider.denom,
      ),
      decimals: contractFromCache.decimals,
      is_erc20: contractFromCache.is_erc20,
      is_erc721: contractFromCache.is_erc721,
      is_erc1155: contractFromCache.is_erc1155,
      is_in_white_list: contractFromCache.is_in_white_list,
      name: contractFromCache.name,
      symbol: contractFromCache.symbol,
      created_at: token.created_at,
      updated_at: token.updated_at,
      chain_id: token.chain_id,
      image: contractFromCache.icon
        ? {uri: contractFromCache.icon}
        : require('@assets/images/empty-icon.png'),
    };

    return result;
  };

  private saveContract = (contract: IContract | undefined) => {
    if (!contract) {
      return;
    }

    Contracts.create(contract.id, contract);
  };

  private getContract = (id: AddressCosmos | AddressEthereum) => {
    return Contracts.getById(id);
  };

  onMessage = async (message: RPCMessage) => {
    if (message.type !== 'token') {
      return;
    }

    const token = await this.parseIToken(message.data);
    this.update(token.id, token);
  };

  clear() {
    runInAction(() => {
      this.data = {};
      this.tokens = {};
      this._isLoading = false;
    });
  }
}

const instance = new TokensStore(Boolean(process.env.JEST_WORKER_ID));
export {instance as Token};
