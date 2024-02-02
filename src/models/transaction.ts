import {hashMessage} from '@walletconnect/utils';
import {makeAutoObservable, runInAction, when} from 'mobx';
import {isHydrated} from 'mobx-persist-store';

import {app} from '@app/contexts';
import {Events} from '@app/events';
import {awaitForRealm} from '@app/helpers/await-for-realm';
import {realm} from '@app/models/index';
import {TransactionRealmObject} from '@app/models/realm-object-for-migration';
import {Wallet} from '@app/models/wallet';
import {Indexer} from '@app/services/indexer';
import {IndexerTransaction, MobXStoreFromRealm} from '@app/types';
import {STORE_REHYDRATION_TIMEOUT_MS} from '@app/variables/common';

export enum TransactionStatus {
  failed,
  success,
  inProgress,
}

export type Transaction = IndexerTransaction;

class TransactionStore implements MobXStoreFromRealm {
  realmSchemaName = TransactionRealmObject.schema.name;
  private _transactions: Array<Transaction> = [];
  private _lastSyncedAccountsHash = '';
  private _lastSyncedBlockNumber = 'latest';
  private _isLoading = false;

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

  migrate = async () => {
    await awaitForRealm();
    await when(() => this.isHydrated, {
      timeout: STORE_REHYDRATION_TIMEOUT_MS,
    });

    const realmData = realm.objects<Transaction>(this.realmSchemaName);
    if (realmData.length > 0) {
      realmData.forEach(item => {
        realm.write(() => realm.delete(item));
      });
    }
  };

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
      this._transactions.find(
        transaction => transaction.id.toLowerCase() === transactionLowerCaseId,
      ) || null
    );
  }

  getByHash(hash: string) {
    const transactionLowerCaseHash = hash.toLowerCase();
    return (
      this._transactions.find(
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
    const blockNumber = isHashEquals && lastTx ? `${lastTx.block}` : 'latest';

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

  fetchLatestTransactions = async (accounts: string[]) => {
    if (this.isLoading) {
      return;
    }
    const newTxs = await this._fetch(accounts, 'latest');

    runInAction(() => {
      this._transactions = newTxs;
      this._isLoading = false;
    });
    return newTxs;
  };

  private _fetch = (accounts: string[], blockNumber = 'latest') => {
    try {
      runInAction(() => {
        this._isLoading = true;

        const accountHash = hashMessage(accounts.join(''));
        if (
          blockNumber === 'latest' &&
          this._lastSyncedAccountsHash !== accountHash
        ) {
          this._transactions = [];
        }

        this._lastSyncedAccountsHash = accountHash;
        this._lastSyncedBlockNumber = blockNumber;
      });

      return Indexer.instance.getTransactions(
        accounts,
        blockNumber,
        app.providerId,
      );
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
