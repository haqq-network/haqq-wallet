import {ethers} from 'ethers';
import {makeAutoObservable, runInAction, toJS, when} from 'mobx';
import {makePersistable} from 'mobx-persist-store';

import {app} from '@app/contexts';
import {DEBUG_VARS} from '@app/debug-vars';
import {AddressUtils, NATIVE_TOKEN_ADDRESS} from '@app/helpers/address-utils';
import {Whitelist} from '@app/helpers/whitelist';
import {I18N, getText} from '@app/i18n';
import {Contracts} from '@app/models/contracts';
import {Socket} from '@app/models/socket';
import {Wallet} from '@app/models/wallet';
import {Balance} from '@app/services/balance';
import {Indexer, IndexerUpdatesResponse} from '@app/services/indexer';
import {storage} from '@app/services/mmkv';
import {
  AddressType,
  HaqqCosmosAddress,
  IContract,
  IToken,
  IndexerToken,
  IndexerTokensData,
  MobXStore,
} from '@app/types';
import {RPCMessage} from '@app/types/rpc';
import {ERC20_ABI} from '@app/variables/abi';
import {CURRENCY_NAME, WEI, WEI_PRECISION} from '@app/variables/common';

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

  create(id: string, params: IToken) {
    const existingItem = this.getById(params.id);

    if (existingItem) {
      this.update(existingItem.id, params);
    } else {
      this.data = {
        ...this.data,
        [id]: params,
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
    delete newData[id];

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
    return this.data[id];
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
      [id]: {
        ...itemToUpdate,
        ...item,
        value: updatedValue,
      },
    };
    return true;
  }

  fetchTokens = async (
    force = false,
    fetchTokensFromRPC = DEBUG_VARS.enableHardcodeERC20TokensContract,
  ) => {
    if (this.isLoading && !force) {
      return;
    }

    runInAction(() => {
      this._isLoading = true;
    });

    const wallets = Wallet.getAll();
    const accounts = wallets.map(w => w.cosmosAddress);
    const updates = await Indexer.instance.updates(accounts, this.lastUpdate);
    let result = await this.parseIndexerTokens(updates);
    result = await getHardcodedTokens(result, fetchTokensFromRPC);
    this.recalculateCommulativeSum(result);

    runInAction(() => {
      if (app.isTesterMode) {
        Logger.log('TokensStore fetchTokens', JSON.stringify(result, null, 2));
      }
      this.tokens = result;
      this._isLoading = false;
    });
  };

  public generateIslamicToken = (wallet: Wallet): IToken => {
    const balance = app.getAvailableBalance(wallet.address);

    return {
      id: AddressUtils.toHaqq(NATIVE_TOKEN_ADDRESS),
      contract_created_at: '',
      contract_updated_at: '',
      value: balance,
      decimals: WEI,
      is_erc20: false,
      is_erc721: false,
      is_erc1155: false,
      is_in_white_list: true,
      name: getText(I18N.transactionConfirmationIslamicCoin),
      symbol: CURRENCY_NAME,
      created_at: '',
      updated_at: '',
      image: require('@assets/images/islm_icon.png'),
    };
  };

  public generateIslamicTokenContract = (): IContract => {
    return {
      id: AddressUtils.toHaqq(NATIVE_TOKEN_ADDRESS),
      eth_address: AddressUtils.toEth(NATIVE_TOKEN_ADDRESS),
      address_type: AddressType.contract,
      is_skip_eth_tx: false,
      min_input_amount: '18',
      decimals: WEI_PRECISION,
      is_erc20: false,
      is_erc721: false,
      is_erc1155: false,
      is_in_white_list: true,
      name: getText(I18N.transactionConfirmationIslamicCoin),
      symbol: CURRENCY_NAME,
      created_at: '',
      updated_at: '',
      icon: require('@assets/images/islm_icon.png'),
    };
  };

  private getTokenContract = async (
    token: IndexerToken,
  ): Promise<IContract> => {
    try {
      const contract = await Whitelist.verifyAddress(token.contract);
      return (contract || {}) as IContract;
    } catch (e) {
      return {} as IContract;
    }
  };

  private parseIndexerTokens = async (
    data: IndexerUpdatesResponse,
  ): Promise<IndexerTokensData> => {
    const tokensAndContracts = await Promise.all(
      data.tokens.map(async token => {
        try {
          const contract = await Whitelist.verifyAddress(token.contract);
          return {
            token,
            contract: (contract || {}) as IContract,
          };
        } catch (e) {
          return {
            token,
            contract: {} as IContract,
          };
        }
      }),
    );

    return Wallet.getAll().reduce((acc, w) => {
      if (!Array.isArray(data.tokens)) {
        return {
          ...acc,
          [w.address]: [this.generateIslamicToken(w)],
        };
      }

      const addressTokens: IToken[] = tokensAndContracts
        .filter(
          ({token}) =>
            !!token.contract &&
            new Balance(token.value).isPositive() &&
            AddressUtils.toEth(token.address) === w.address,
        )
        .map(({token, contract}) => {
          const hasCache = this.hasContractCache(token.contract);
          if (!hasCache) {
            const contractFromAdresses = data.addresses.find(
              item => item.id === token.contract,
            );
            this.saveContract(contractFromAdresses);
          } else {
            this.saveContract(contract);
          }

          const contractFromCache = this.getContract(token.contract);

          const result: IToken = {
            id: contractFromCache.id,
            contract_created_at: contractFromCache.created_at,
            contract_updated_at: contractFromCache.updated_at,
            value: new Balance(
              token.value,
              contractFromCache.decimals || WEI_PRECISION,
              contractFromCache.symbol || CURRENCY_NAME,
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
            image: contractFromCache.icon
              ? {uri: contractFromCache.icon}
              : require('@assets/images/empty-icon.png'),
          };

          return result;
        });

      return {
        ...acc,
        [w.address]: [this.generateIslamicToken(w), ...addressTokens],
      };
    }, {});
  };

  private parseIToken = async (token: IndexerToken) => {
    const contract = await this.getTokenContract(token);
    this.saveContract(contract);

    const contractFromCache = this.getContract(token.contract);

    const result: IToken = {
      id: contractFromCache.id,
      contract_created_at: contractFromCache.created_at,
      contract_updated_at: contractFromCache.updated_at,
      value: new Balance(
        token.value,
        contractFromCache.decimals || WEI_PRECISION,
        contractFromCache.symbol || CURRENCY_NAME,
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
      image: contractFromCache.icon
        ? {uri: contractFromCache.icon}
        : require('@assets/images/empty-icon.png'),
    };

    return result;
  };

  private hasContractCache = (id: HaqqCosmosAddress) => {
    return !!Contracts.getById(id);
  };

  private saveContract = (contract: IContract | undefined) => {
    if (!contract) {
      return;
    }

    Contracts.create(contract.id, contract);
  };

  private getContract = (id: HaqqCosmosAddress) => {
    return Contracts.getById(id);
  };

  private recalculateCommulativeSum = (tokens: TokensStore['tokens']) => {
    const walletsTokens = Object.values(tokens).flat(2);
    this.removeAll();
    walletsTokens.forEach(token => this.create(token.id, token));
  };

  onMessage = async (message: RPCMessage) => {
    if (message.type !== 'token') {
      return;
    }

    const token = await this.parseIToken(message.data);
    this.update(token.id, token);
  };
}

const instance = new TokensStore(Boolean(process.env.JEST_WORKER_ID));
export {instance as Token};

async function getHardcodedTokens(
  tokensDataToMerge: IndexerTokensData = {},
  enabled = false,
) {
  const wallets = Wallet.addressList();
  if (enabled) {
    const contracts =
      DEBUG_VARS.hardcodeERC20TokensContract[app.provider.ethChainId];

    if (contracts.length) {
      const tokens = await Promise.all(
        wallets
          .map(async wallet => {
            return [
              wallet,
              [
                ...toJS(tokensDataToMerge[wallet]),
                ...(
                  await Promise.all(
                    contracts
                      .map(async contract => {
                        const etherProvider =
                          new ethers.providers.JsonRpcProvider(
                            app.provider.ethRpcEndpoint,
                          );
                        const contractInterface = new ethers.Contract(
                          contract,
                          ERC20_ABI,
                          etherProvider,
                        );

                        const balanceResult = await contractInterface.balanceOf(
                          wallet,
                        );

                        const contractInfo = await Whitelist.verifyAddress(
                          AddressUtils.toHaqq(contract),
                        );

                        let symbol =
                          contractInfo?.symbol ||
                          (await contractInterface.symbol());
                        let decimals =
                          contractInfo?.decimals ||
                          (await contractInterface.decimals());
                        let name =
                          contractInfo?.name ||
                          (await contractInterface.name());

                        const balance = new Balance(
                          balanceResult,
                          decimals,
                          symbol,
                        );

                        if (!balance.isPositive()) {
                          return;
                        }

                        return {
                          id: AddressUtils.toHaqq(contract),
                          contract_created_at: '',
                          contract_updated_at: '',
                          value: balance,
                          decimals: decimals,
                          is_erc20: true,
                          is_erc721: false,
                          is_erc1155: false,
                          is_in_white_list: true,
                          name: name,
                          symbol: symbol,
                          created_at: '',
                          updated_at: '',
                          image: contractInfo?.icon
                            ? {uri: contractInfo?.icon}
                            : require('@assets/images/empty-icon.png'),
                        } as IToken;
                      })
                      .filter(Boolean),
                  )
                ).filter(Boolean),
              ].filter(
                // remove duplicates
                (token, index, self) =>
                  self.findIndex(t =>
                    AddressUtils.equals(t?.id!, token?.id!),
                  ) === index,
              ),
            ].filter(Boolean);
          })
          .filter(Boolean),
      );
      return Object.fromEntries(tokens) as IndexerTokensData;
    }
  }
  return tokensDataToMerge;
}
