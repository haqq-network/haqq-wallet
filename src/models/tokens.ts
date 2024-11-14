import {makeAutoObservable, runInAction, when} from 'mobx';
import {makePersistable} from 'mobx-persist-store';

import {AddressUtils, NATIVE_TOKEN_ADDRESS} from '@app/helpers/address-utils';
import {Socket} from '@app/models/socket';
import {IWalletModel, Wallet} from '@app/models/wallet';
import {Balance} from '@app/services/balance';
import {Indexer, IndexerAddressesResponse} from '@app/services/indexer';
import {storage} from '@app/services/mmkv';
import {
  AddressEthereum,
  AddressType,
  ChainId,
  IContract,
  IToken,
  IndexerToken,
  IndexerTokensData,
  MobXStore,
} from '@app/types';
import {RPCMessage} from '@app/types/rpc';
import {createAsyncTask} from '@app/utils';

import {Provider, ProviderModel} from './provider';

const logger = Logger.create('TokensStore', {
  emodjiPrefix: '🟢',
  stringifyJson: true,
});

class TokensStore implements MobXStore<IToken> {
  /**
   * All tokens available for all wallets with commulative value
   * @key Token contract address
   * @value IToken
   */
  data: Record<string, IToken> = {};
  fetchedUnknownTokens: Record<string, boolean> = {};
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
          'fetchedUnknownTokens',
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
    let token = this.data[AddressUtils.toEth(id)];

    if (!token) {
      token = Object.values(this.tokens)
        .flat()
        .find(t => t.id === id)!;
    }

    if (!token) {
      this._safeLoadUnknownToken(id);
    }

    return token;
  }

  /**
   * Load unknown token by id
   * @param id - token id
   */
  private _safeLoadUnknownToken = createAsyncTask(async (id: string) => {
    try {
      if (this.fetchedUnknownTokens[id]) {
        return;
      }

      const headers = Indexer.instance.getProvidersHeader([id]);
      const contracts = await Indexer.instance.getAddresses(headers);
      const tokensForAnyChains = Object.entries(contracts).flatMap(
        ([chain_id, v]) => v.map(c => ({...c, chain_id: Number(chain_id)})),
      ) as (IContract & {chain_id: number})[];

      runInAction(() => {
        this.fetchedUnknownTokens[id] = true;
      });

      // find token with name, symbol, decimals and is_erc20
      const token = tokensForAnyChains?.find(
        t => t.name && t.symbol && t.decimals && t.is_erc20,
      );

      if (token) {
        runInAction(() => {
          this.data[AddressUtils.toEth(token.id)] = {
            ...token,
            contract_created_at: token.created_at,
            contract_updated_at: token.updated_at,
            value: new Balance('0x0', token.decimals!, token.symbol!),
            chain_id: token.chain_id!,
            image: token.icon
              ? {uri: token.icon}
              : require('@assets/images/empty-icon.png'),
          };
        });
      }
    } catch (e) {
      Logger.error('TokensStore: _safeLoadUnknownToken: error', {
        error: e,
        id,
      });
    }
  });

  update(id: string | undefined, item: Omit<IToken, 'id'>) {
    if (!id) {
      return false;
    }
    const itemToUpdate = this.getById(id);
    if (!itemToUpdate) {
      return false;
    }

    const updatedValue = itemToUpdate.value.operate(item.value, 'add');

    runInAction(() => {
      this.data = {
        ...this.data,
        [AddressUtils.toEth(id)]: {
          ...itemToUpdate,
          ...item,
          value: updatedValue,
        },
      };
    });

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

    const _tokens = {} as Record<AddressEthereum, IToken[]>;
    const _data = {} as Record<AddressEthereum, IToken>;

    wallets.forEach(wallet => {
      const nativeTokens = this.generateNativeTokens(wallet);
      _tokens[AddressUtils.toEth(wallet.cosmosAddress)] = [...nativeTokens];
    });

    const TRON_PROVIDER_CHAIN_IDS = Provider.getAll()
      .filter(p => p.isTron)
      .map(p => p.ethChainId as ChainId);

    const contracts = await Indexer.instance.getAddresses(
      updates.tokens.reduce(
        (prev, cur) => {
          return {
            ...prev,
            [cur.chain_id]: [...(prev[cur.chain_id] || []), cur.contract],
          };
        },
        {} as Record<ChainId, string[]>,
      ),
    );

    for await (const t of updates.tokens) {
      try {
        const isPositive = new Balance(t.value).isPositive();
        if (!isPositive) {
          continue;
        }

        const token = await this.parseIToken(t, contracts);

        if (!token) {
          logger.error('fetchTokens: skipping token', {
            token,
          });
          continue;
        }

        const isTron = TRON_PROVIDER_CHAIN_IDS.includes(t.chain_id);

        let walletAddress = '' as AddressEthereum;

        if (isTron) {
          const w = AddressUtils.getWalletByAddress(t.address);
          if (w) {
            walletAddress = w.address;
          } else {
            walletAddress = t.address.startsWith('0x')
              ? (t.address as AddressEthereum)
              : AddressUtils.tronToHex(t.address);
          }
        } else {
          walletAddress = AddressUtils.toEth(t.address);
        }

        if (!_tokens[walletAddress]?.length) {
          const wallet = Wallet.getById(walletAddress);
          const nativeTokens = this.generateNativeTokens(wallet!);

          _tokens[walletAddress] = [...nativeTokens];
        }

        _tokens[walletAddress].push(token);
        _data[AddressUtils.toEth(token.id)] = token;
      } catch (e) {
        logger.error('fetchTokens: error during parsing tokens', {
          error: e,
          tokenAddress: t.address,
          chainId: t.chain_id,
        });
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
    const balance = Wallet.getBalance(wallet.address, 'available', provider);

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

  private parseIToken = async (
    token: IndexerToken,
    contracts: IndexerAddressesResponse,
  ) => {
    const contratsForChainId = contracts[token.chain_id] || [];
    const contract = contratsForChainId.find(c => c.id === token.contract);

    if (!contract) {
      logger.error('parseIToken: Contract not found', {
        token,
        contratsForChainId,
      });
      return null;
    }

    const result: IToken = {
      id: AddressUtils.toHaqq(contract.id),
      contract_created_at: contract.created_at,
      contract_updated_at: contract.updated_at,
      value: new Balance(
        token.value,
        contract.decimals || Provider.selectedProvider.decimals,
        contract.symbol || Provider.selectedProvider.denom,
      ),
      decimals: contract.decimals,
      is_erc20: contract.is_erc20,
      is_erc721: contract.is_erc721,
      is_erc1155: contract.is_erc1155,
      is_in_white_list: contract.is_in_white_list,
      name: contract.name,
      symbol: contract.symbol,
      created_at: token.created_at,
      updated_at: token.updated_at,
      chain_id: token.chain_id,
      image: contract.icon
        ? {uri: contract.icon}
        : require('@assets/images/empty-icon.png'),
    };

    return result;
  };

  onMessage = async (message: RPCMessage) => {
    if (message.type !== 'token') {
      return;
    }
    const tokenData = message.data;

    const contracts = await Indexer.instance.getAddresses({
      [tokenData.chain_id || Provider.selectedProvider.ethChainId]: [
        tokenData.contract,
      ],
    });

    const token = await this.parseIToken(tokenData, contracts);
    if (token) {
      this.update(token.id, token);
    }
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
