import {isHydrated} from '@override/mobx-persist-store';
import {makeAutoObservable, runInAction, when} from 'mobx';

import {IconProps} from '@app/components/ui';
import {AddressUtils} from '@app/helpers/address-utils';
import {indexerTransactionMock} from '@app/helpers/indexer-transaction-mock';
import {parseTransaction} from '@app/helpers/indexer-transaction-utils';
import {Socket} from '@app/models/socket';
import {Wallet} from '@app/models/wallet';
import {Balance} from '@app/services/balance';
import {Indexer} from '@app/services/indexer';
import {
  TransactionRpcResult,
  TransactionRpcStore,
} from '@app/services/rpc/evm-transaction';
import {
  AddressEthereum,
  ChainId,
  IndexerTransaction,
  IndexerTxMsgType,
  IndexerTxParsedTokenInfo,
} from '@app/types';
import {RPCMessage, RPCObserver} from '@app/types/rpc';
import {createAsyncTask} from '@app/utils';

import {AppStore} from './app';
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

class TransactionStore implements RPCObserver {
  private _transactions: Array<Transaction> = [];
  private _lastSyncedTransactionTs: string = 'latest';
  private _isLoading = false;

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

  create(transaction: IndexerTransaction, accounts: Record<ChainId, string[]>) {
    const existingTransaction = this.getById(transaction.id);

    const newTransaction: Transaction = parseTransaction(
      {
        ...existingTransaction,
        ...transaction,
      },
      accounts,
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

  getById(id: string, txType?: IndexerTxMsgType) {
    const transactionLowerCaseId = id.toLowerCase();
    return (
      this.getAll().find(transaction => {
        if (txType) {
          return (
            transaction.id.toLowerCase() === transactionLowerCaseId &&
            transaction.msg.type === txType
          );
        }
        return transaction.id.toLowerCase() === transactionLowerCaseId;
      }) || null
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

  getForWallets(addresses: string[]) {
    try {
      const addressList = addresses.map(AddressUtils.toEth);
      return this.getAll().filter(tx => {
        if (tx.forWallet) {
          return tx.forWallet.some(wallet =>
            addressList.includes(wallet as AddressEthereum),
          );
        }
        return false;
      });
    } catch (e) {
      Logger.captureException(e, 'TransactionStore.getForWallets', {
        addresses,
      });
      return [];
    }
  }

  remove(id: string) {
    this._transactions = this._transactions.filter(
      transaction => transaction.id !== id,
    );
  }

  removeAll() {
    this._lastSyncedTransactionTs = 'latest';
    this._transactions = [];
  }

  fetchNextTransactions = async (accounts: string[]) => {
    if (this.isLoading) {
      return;
    }

    const nextTxList = await this._fetch(
      Indexer.instance.getProvidersHeader(accounts),
    );

    runInAction(() => {
      this._transactions = [...this._transactions, ...nextTxList].filter(
        (value, index, self) =>
          index === self.findIndex(t => t.id === value.id),
      );
      this._isLoading = false;
    });

    return nextTxList;
  };

  fetchLatestTransactions = async (accounts: string[], force = false) => {
    if (this.isLoading && !force) {
      return;
    }

    const newTxs = await this._fetch(
      Indexer.instance.getProvidersHeader(accounts),
      'latest',
    );

    runInAction(() => {
      this._transactions = newTxs;
      this._isLoading = false;
    });
    return newTxs;
  };

  private _fetch = createAsyncTask(
    async (accounts: Record<ChainId, string[]>, ts?: string) => {
      try {
        runInAction(() => {
          this._isLoading = true;
        });
        let result: IndexerTransaction[];

        /*
         * FETCH TRANSACTIONS FROM RPC ONLY
         */
        if (AppStore.isRpcOnly) {
          const addresses = accounts[Provider.selectedProvider.ethChainId].map(
            AddressUtils.toEth,
          );
          const txExplorer = TransactionRpcStore.getInstance(addresses);

          let rawTxs: TransactionRpcResult;
          if (ts === 'latest') {
            rawTxs = await txExplorer.getPage(1);
          } else {
            rawTxs = await txExplorer.nextPage();
          }
          result = rawTxs.getAll().map(tx => indexerTransactionMock(tx));
        } else {
          /*
           * FETCH TRANSACTIONS FROM INDEXER
           */
          result = await Indexer.instance.getTransactions(
            accounts,
            ts ?? this._lastSyncedTransactionTs,
          );
        }
        await when(() => !Token.isLoading, {});
        const parsed = result
          .map(tx => parseTransaction(tx, accounts))
          .filter(tx => !!tx.parsed);

        // If new transactions exists than _lastSyncedTransactionTs must be updated
        // If transactions array is empty it's mean all transactions fetched and _lastSyncedTransactionTs mustn't be updated
        if (parsed.length) {
          this._lastSyncedTransactionTs =
            parsed[parsed.length - 1]?.ts ?? 'latest';
        }

        return parsed;
      } catch (e) {
        Logger.captureException(e, 'TransactionStore._fetch', {
          accounts,
          transactionTs: this._lastSyncedTransactionTs,
        });
        return [];
      }
    },
  );

  onMessage = (message: RPCMessage) => {
    if (message.type !== 'transaction') {
      return;
    }

    const result = message.data.txs || message.data.transactions || [];
    const accounts = Indexer.instance.getProvidersHeader(Wallet.addressList());
    const parsed = result
      .map(tx => parseTransaction(tx, accounts))
      .filter(tx => !!tx.parsed);

    parsed.forEach(transaction => this.create(transaction, accounts));
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
