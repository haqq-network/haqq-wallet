import {hashMessage} from '@walletconnect/utils';
import {makeAutoObservable, runInAction} from 'mobx';
import {isHydrated} from 'mobx-persist-store';

import {IconProps} from '@app/components/ui';
import {app} from '@app/contexts';
import {Events} from '@app/events';
import {parseTransaction} from '@app/helpers/indexer-transaction-utils';
import {TransactionRealmObject} from '@app/models/realm-object-for-migration';
import {Wallet} from '@app/models/wallet';
import {Balance} from '@app/services/balance';
import {Indexer} from '@app/services/indexer';
import {IndexerTransaction, IndexerTxParsedTokenInfo} from '@app/types';

export enum TransactionStatus {
  failed,
  success,
  inProgress,
}

export interface ParsedTransactionData {
  from: string;
  to: string;
  title: string;
  subtitle: string;
  icon: IconProps['name'];
  isCosmosTx: boolean;
  isEthereumTx: boolean;
  isContractInteraction: boolean;
  isIncoming: boolean;
  isOutcoming: boolean;
  amount: Balance[];
  tokens: IndexerTxParsedTokenInfo[];
}

export type Transaction = IndexerTransaction & {
  parsed: ParsedTransactionData;
};

type AccountsHash = string;
type BlockNumber = 'latest' | `${number}`;
type CacheKey = `${AccountsHash}:${BlockNumber}`;

class TransactionStore {
  realmSchemaName = TransactionRealmObject.schema.name;
  private _transactions: Array<Transaction> = [];
  private _lastSyncedAccountsHash: AccountsHash = '';
  private _lastSyncedBlockNumber: BlockNumber = 'latest';
  private _isLoading = false;
  private _cache = new Map<CacheKey, Transaction[]>();

  constructor() {
    makeAutoObservable(this);
    app.on(Events.onProviderChanged, () => {
      this.removeAll();
      this.fetchLatestTransactions(Wallet.addressList());
    });
  }

  get isHydrated() {
    return isHydrated(this);
  }

  get isLoading() {
    return this._isLoading;
  }

  create(transaction: Transaction) {
    const existingTransaction = this.getById(transaction.id);

    const newTransaction: Transaction = {
      ...existingTransaction,
      ...transaction,
    };

    if (existingTransaction) {
      this.update(newTransaction.id, newTransaction);
    } else {
      this._transactions.push(newTransaction);
    }

    return newTransaction;
  }

  update(id: string, params: Partial<Transaction>) {
    const transaction = this.getById(id);

    if (transaction) {
      this._transactions = this._transactions.map(t => {
        if (t.id === transaction.id) {
          return {...t, ...params} as Transaction;
        }
        return t;
      });
    }
  }

  getById(id: string) {
    const transactionLowerCaseId = id.toLowerCase();
    return (
      this.getAll().find(
        transaction => transaction.id.toLowerCase() === transactionLowerCaseId,
      ) || null
    );
  }

  getByHash(hash: string) {
    const transactionLowerCaseHash = hash.toLowerCase();
    return (
      this.getAll().find(
        transaction =>
          transaction.hash.toLowerCase() === transactionLowerCaseHash,
      ) || null
    );
  }

  getAll() {
    return this._transactions;
  }

  remove(id: string) {
    this._transactions = this._transactions.filter(
      transaction => transaction.id !== id,
    );
  }

  removeAll() {
    this._lastSyncedAccountsHash = '';
    this._lastSyncedBlockNumber = 'latest';
    this._transactions = [];
  }

  fetchNextTransactions = async (accounts: string[]) => {
    if (this.isLoading) {
      return;
    }
    const accountHash = hashMessage(accounts.join(''));
    const isHashEquals = this._lastSyncedAccountsHash === accountHash;

    const prevTxList = this._transactions;
    const lastTx = prevTxList[prevTxList.length - 1];
    const blockNumber: BlockNumber =
      isHashEquals && lastTx ? `${lastTx.block}` : 'latest';

    if (isHashEquals && blockNumber === this._lastSyncedBlockNumber) {
      return this._transactions;
    }

    const nextTxList = await this._fetch(accounts, blockNumber);

    runInAction(() => {
      this._transactions = [...prevTxList, ...nextTxList];
      this._isLoading = false;
    });

    return nextTxList;
  };

  fetchLatestTransactions = async (accounts: string[], force = false) => {
    if (this.isLoading && !force) {
      return;
    }
    const newTxs = await this._fetch(accounts, 'latest');

    runInAction(() => {
      this._transactions = newTxs;
      this._isLoading = false;
    });
    return newTxs;
  };

  private _fetch = async (
    accounts: string[],
    blockNumber: BlockNumber = 'latest',
  ) => {
    try {
      runInAction(() => {
        this._isLoading = true;

        const accountHash = hashMessage(accounts.join(''));
        if (
          blockNumber === 'latest' &&
          this._lastSyncedAccountsHash !== accountHash
        ) {
          const cahced = this._cache.get(`${accountHash}:${blockNumber}`);
          if (cahced?.length) {
            this._transactions = cahced;
          } else {
            this._transactions = [];
          }
        }

        this._lastSyncedAccountsHash = accountHash;
        this._lastSyncedBlockNumber = blockNumber;
      });

      const result = await Indexer.instance.getTransactions(
        accounts,
        blockNumber,
        app.providerId,
      );
      const parsed = result
        .map(tx => parseTransaction(tx, accounts))
        .filter(tx => !!tx.parsed);
      this._cache.set(`${this._lastSyncedAccountsHash}:${blockNumber}`, parsed);
      return parsed;
    } catch (e) {
      Logger.captureException(e, 'TransactionStore._fetch', {
        accounts,
        blockNumber,
      });
      return [];
    }
  };
}

const instance = new TransactionStore();
export {instance as Transaction};
