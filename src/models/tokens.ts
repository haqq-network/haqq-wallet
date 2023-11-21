import {makeAutoObservable, runInAction} from 'mobx';
import {makePersistable} from 'mobx-persist-store';

import {app} from '@app/contexts';
import {AddressUtils} from '@app/helpers/address-utils';
import {I18N, getText} from '@app/i18n';
import {Contracts} from '@app/models/contracts';
import {Wallet} from '@app/models/wallet';
import {Balance} from '@app/services/balance';
import {Indexer, IndexerUpdatesResponse} from '@app/services/indexer';
import {storage} from '@app/services/mmkv';
import {
  HaqqCosmosAddress,
  IContract,
  IToken,
  IndexerTokensData,
  MobXStore,
} from '@app/types';
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
      });
    }
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

  private generateIslamicToken = (wallet: Wallet): IToken => {
    const balance = app.getAvailableBalance(wallet.address);

    return {
      id: wallet.address as HaqqCosmosAddress,
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

  private parseIndexerTokens = (
    data: IndexerUpdatesResponse,
  ): IndexerTokensData => {
    return Wallet.getAll().reduce((acc, w) => {
      if (!Array.isArray(data.tokens)) {
        return {
          ...acc,
          [w.address]: [this.generateIslamicToken(w)],
        };
      }

      const addressTokens: IToken[] = data.tokens
        .filter(
          token =>
            !!token.contract && AddressUtils.toEth(token.address) === w.address,
        )
        .map(token => {
          const hasCache = this.hasContractCache(token.contract);
          if (!hasCache) {
            const contract = data.addresses.find(
              item => item.id === token.contract,
            );
            this.saveContract(contract);
          }

          // We saved contract in cache on previous step
          const contract = this.getContract(token.contract);
          const result: IToken = {
            id: contract.id,
            contract_created_at: contract.created_at,
            contract_updated_at: contract.updated_at,
            value: new Balance(
              token.value,
              contract.decimals || WEI_PRECISION,
              contract.symbol || CURRENCY_NAME,
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
            image: contract.icon
              ? {uri: contract.icon}
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

  fetchTokens = async () => {
    const wallets = Wallet.getAll();
    const accounts = wallets.map(w => AddressUtils.toEth(w.cosmosAddress));
    const updates = await Indexer.instance.updates(accounts, this.lastUpdate);
    const result = this.parseIndexerTokens(updates);
    // this.lastUpdate = new Date();
    this.recalculateCommulativeSum(result);

    runInAction(() => {
      this.tokens = result;
    });
  };
}

const instance = new TokensStore(Boolean(process.env.JEST_WORKER_ID));
export {instance as Token};
