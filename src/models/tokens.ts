import {makeAutoObservable, runInAction} from 'mobx';
import {makePersistable} from 'mobx-persist-store';

import {Wallet} from '@app/models/wallet';
import {Balance} from '@app/services/balance';
import {Indexer, IndexerUpdatesResponse} from '@app/services/indexer';
import {storage} from '@app/services/mmkv';
import {IContract, IToken, IndexerTokensData, MobXStore} from '@app/types';
import {WEI_PRECISION} from '@app/variables/common';

class TokensStore implements MobXStore<IToken> {
  /**
   * All tokens available for all wallets with commulative value
   * @key Token contract address
   * @value IToken
   */
  data: Record<string, IToken> = {};
  /**
   * Token's contracts (using for caching)
   * @key Token contract address
   * @value IContract
   */
  contracts: Record<string, IContract> = {};
  /**
   * Indexer response with token info
   * @key Wallet address
   * @value Array of tokens for this wallet address
   */
  tokens: IndexerTokensData = {};
  private lastUpdate = new Date(0);

  constructor(shouldSkipPersisting: boolean = false) {
    makeAutoObservable(this);
    if (!shouldSkipPersisting) {
      makePersistable(this, {
        name: this.constructor.name,
        properties: [
          {
            key: 'data',
            deserialize: (stringObject: string): this['data'] => {
              const value = JSON.parse(stringObject) as this['data'];
              const keys = Object.keys(value);
              const newValue = keys.reduce((prev, cur) => {
                return {
                  ...prev,
                  [cur]: {
                    ...value[cur],
                    value: Balance.fromJsonString(value[cur].value),
                  },
                };
              }, {});

              return newValue;
            },
            serialize: (value: this['data']): string => {
              const keys = Object.keys(value);
              const newValue = keys.reduce((prev, cur) => {
                return {
                  ...prev,
                  [cur]: {
                    ...value[cur],
                    value: value[cur].value.toJsonString(),
                  },
                };
              }, {});

              return JSON.stringify(newValue);
            },
          },
          // https://github.com/quarrant/mobx-persist-store/issues/97
          // @ts-ignore
          'contracts',
          {
            // @ts-ignore
            key: 'tokens',
            // @ts-ignore
            deserialize: (stringObject: string): this['tokens'] => {
              const value = JSON.parse(stringObject) as this['tokens'];
              const keys = Object.keys(value);
              const newValue = keys.reduce((prev, cur) => {
                return {
                  ...prev,
                  [cur]: value[cur].map(item => ({
                    ...item,
                    value: Balance.fromJsonString(item.value),
                  })),
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
                  [cur]: value[cur].map(item => ({
                    ...item,
                    value: item.value.toJsonString(),
                  })),
                };
              }, {});

              return JSON.stringify(newValue);
            },
          },
        ],
        storage: storage,
      });
    }
  }

  create(id: string, params: IToken) {
    const existingItem = this.getById(params.id);
    const newItem = {
      ...existingItem,
      ...params,
    };

    if (existingItem) {
      this.update(existingItem.id, params);
    } else {
      this.data = {
        ...this.data,
        [params.id]: newItem,
      };
    }

    return params.id;
  }

  remove(id: string | undefined) {
    if (!id) {
      return false;
    }
    const bannerToRemove = this.getById(id);
    if (!bannerToRemove) {
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
    const keys = Object.keys(this.data);
    return keys.map(id => {
      const item = this.data[id];
      return {...item, id};
    });
  }

  getAllVisible() {
    const keys = Object.keys(this.data);
    return keys
      .map(id => {
        const item = this.data[id];
        return {...item, id};
      })
      .filter(item => !!item.is_in_white_list);
  }

  getById(id: string) {
    return this.data[id];
  }

  update(id: string | undefined, item: Omit<Partial<IToken>, 'id'>) {
    if (!id) {
      return false;
    }
    const itemToUpdate = this.getById(id);
    if (!itemToUpdate) {
      return false;
    }

    const updatedValue = new Balance(itemToUpdate.value).operate(
      item.value,
      'add',
    );

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

  private parseIndexerTokens = (
    data: IndexerUpdatesResponse,
  ): IndexerTokensData => {
    return Wallet.getAll().reduce((acc, w) => {
      if (!Array.isArray(data.tokens)) {
        return {
          ...acc,
          [w.address]: [],
        };
      }

      const addressTokens: IToken[] = data.tokens
        .filter(token => !!token.contract)
        .map(token => {
          const hasCache = !!this.contracts[token.contract];
          if (!hasCache) {
            const contract = data.addresses.find(
              item => item.id === token.contract,
            );
            this.saveContract(contract);
          }

          const contract = this.contracts[token.contract]!;
          const result = {
            id: contract.id,
            contract_created_at: contract.created_at,
            contract_updated_at: contract.updated_at,
            value: new Balance(token.value, contract.decimals || WEI_PRECISION),
            decimals: contract.decimals,
            is_erc20: contract.is_erc20,
            is_erc721: contract.is_erc721,
            is_erc1155: contract.is_erc1155,
            is_in_white_list: contract.is_in_white_list,
            name: contract.name,
            symbol: contract.symbol,
            created_at: token.created_at,
            updated_at: token.updated_at,
          };
          this.create(result.id, result);

          return result;
        });

      return {
        ...acc,
        [w.address]: addressTokens,
      };
    }, {});
  };

  private saveContract = (contract: IContract | undefined) => {
    if (!contract) {
      return;
    }
    this.contracts = {
      ...this.contracts,
      [contract.id]: contract,
    };
  };

  fetchTokens = async () => {
    const wallets = Wallet.getAll();
    const accounts = wallets.map(w => w.cosmosAddress);
    const updates = await Indexer.instance.updates(accounts, this.lastUpdate);
    const result = this.parseIndexerTokens(updates);
    // this.lastUpdate = new Date();

    runInAction(() => {
      this.tokens = result;
    });
  };
}

const instance = new TokensStore(Boolean(process.env.JEST_WORKER_ID));
export {instance as Token};
