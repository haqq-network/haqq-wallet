import {hashMessage} from '@walletconnect/utils';
import {makeAutoObservable, runInAction, when} from 'mobx';
import {isHydrated} from 'mobx-persist-store';

import {IconProps} from '@app/components/ui';
import {parseTransaction} from '@app/helpers/indexer-transaction-utils';
import {TransactionRealmObject} from '@app/models/realm-object-for-migration';
import {Socket} from '@app/models/socket';
import {Wallet} from '@app/models/wallet';
import {Balance} from '@app/services/balance';
import {Indexer} from '@app/services/indexer';
import {IndexerTransaction, IndexerTxParsedTokenInfo} from '@app/types';
import {RPCMessage, RPCObserver} from '@app/types/rpc';

import {Provider} from './provider';
import {Token} from './tokens';

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
type CacheKey = `${AccountsHash}:${string}`;

class TransactionStore implements RPCObserver {
  realmSchemaName = TransactionRealmObject.schema.name;
  private _transactions: Array<Transaction> = [];
  private _lastSyncedAccountsHash: AccountsHash = '';
  private _lastSyncedTransactionTs: string = 'latest';
  private _isLoading = false;
  private _cache = new Map<CacheKey, Transaction[]>();

  constructor() {
    makeAutoObservable(this);

    when(
      () => Socket.lastMessage.type === 'transaction',
      () => this.onMessage(Socket.lastMessage),
    );
  }

  get isHydrated() {
    return isHydrated(this);
  }

  get isLoading() {
    return this._isLoading;
  }

  create(transaction: IndexerTransaction) {
    const existingTransaction = this.getById(transaction.id);

    const newTransaction: Transaction = parseTransaction(
      {
        ...existingTransaction,
        ...transaction,
      },
      Wallet.addressList(),
    );

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
    this._lastSyncedTransactionTs = 'latest';
    this._transactions = [];
  }

  fetchNextTransactions = async (accounts: string[]) => {
    if (this.isLoading) {
      return;
    }

    const nextTxList = await this._fetch(accounts);

    runInAction(() => {
      this._transactions = [...this._transactions, ...nextTxList];
      this._isLoading = false;
    });

    return nextTxList;
  };

  fetchLatestTransactions = async (accounts: string[], force = false) => {
    if (this.isLoading && !force) {
      return;
    }
    const newTxs = await this._fetch(accounts);

    runInAction(() => {
      this._transactions = newTxs;
      this._isLoading = false;
    });
    return newTxs;
  };

  private _fetch = async (accounts: string[]) => {
    try {
      const accountHash = hashMessage(accounts.join(''));
      const cacheKey: CacheKey = `${Provider.selectedProviderId}${accountHash}:${this._lastSyncedTransactionTs}`;

      runInAction(() => {
        this._isLoading = true;
        if (
          this._lastSyncedTransactionTs === 'latest' &&
          this._lastSyncedAccountsHash !== accountHash
        ) {
          const cahced = this._cache.get(cacheKey);
          if (cahced?.length) {
            this._transactions = cahced;
          } else {
            this._transactions = [];
          }
        }

        this._lastSyncedAccountsHash = accountHash;
      });

      const result = await Indexer.instance.getTransactions(
        accounts,
        this._lastSyncedTransactionTs,
      );
      await when(() => !Token.isLoading, {});
      const parsed = result
        .map(tx => parseTransaction(tx, accounts))
        .filter(tx => !!tx.parsed);
      this._cache.set(cacheKey, parsed);

      this._lastSyncedTransactionTs = parsed[parsed.length - 1]?.ts ?? 'latest';

      return parsed;
    } catch (e) {
      Logger.captureException(e, 'TransactionStore._fetch', {
        accounts,
        transactionTs: this._lastSyncedTransactionTs,
      });
      return [];
    }
  };

  onMessage = (message: RPCMessage) => {
    if (message.type !== 'transaction') {
      return;
    }

    const result = message.data.txs || message.data.transactions || [];
    const accounts = Wallet.addressList();
    const parsed = result
      .map(tx => parseTransaction(tx, accounts))
      .filter(tx => !!tx.parsed);

    parsed.forEach(transaction => this.create(transaction));
  };

  clear() {
    runInAction(() => {
      this._transactions = [];
      this._isLoading = false;
    });
  }
}

const instance = new TransactionStore();
export {instance as Transaction};
