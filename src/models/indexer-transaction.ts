import {TransactionReceipt} from '@ethersproject/abstract-provider';
import {hashMessage} from '@walletconnect/utils';
import {utils} from 'ethers';
import {makeAutoObservable, runInAction} from 'mobx';
import {isHydrated, makePersistable} from 'mobx-persist-store';

import {calcFee} from '@app/helpers';
import {migrateTransaction} from '@app/helpers/migrate-transaction';
import {TransactionRealmObject} from '@app/models/realm-object-for-migration';
import {Balance} from '@app/services/balance';
import {Indexer} from '@app/services/indexer';
import {storage} from '@app/services/mmkv';
import {
  HaqqEthereumAddress,
  IndexerTransaction,
  MobXStoreFromRealm,
} from '@app/types';
import {DEFAULT_FEE} from '@app/variables/common';

export enum TransactionStatus {
  failed,
  success,
  inProgress,
}

class IndexerTransactionStore implements MobXStoreFromRealm {
  realmSchemaName = TransactionRealmObject.schema.name;
  transactions: IndexerTransaction[] = [];
  lastSyncedAccountsHash = '';
  lastSyncedBlockNumber = 'latest';

  constructor(shouldSkipPersisting: boolean = false) {
    makeAutoObservable(this);
    if (!shouldSkipPersisting) {
      makePersistable(this, {
        name: this.constructor.name,
        properties: ['transactions'],
        storage: storage,
      });
    }
  }

  get isHydrated() {
    return isHydrated(this);
  }

  create(
    transaction: IndexerTransaction,
    providerId: string,
    fee: Balance = Balance.Empty,
  ) {
    const existingTransaction = this.getById(transaction.hash.toLowerCase());
    const newTransaction: IndexerTransaction = {
      ...existingTransaction,
      hash: transaction.hash.toLowerCase(),
      block: transaction.block,
      account: transaction.from.toLowerCase(),
      raw: JSON.stringify(transaction),
      from: transaction.from.toLowerCase() as HaqqEthereumAddress,
      to: transaction.to.toLowerCase() as HaqqEthereumAddress,
      contractAddress: transaction.contractAddress
        ? transaction.contractAddress.toLowerCase()
        : null,
      value: parseFloat(utils.formatEther(transaction.value ?? 0)),
      fee: fee.toEther(),
      feeHex: fee.toHex(),
      providerId,
      chainId: String(transaction.chainId),
      createdAt: existingTransaction
        ? existingTransaction.createdAt
        : transaction.timeStamp
        ? parseInt(String(transaction.timeStamp), 10) * 1000
        : Date.now(),
      confirmed: transaction.confirmations
        ? parseInt(String(transaction.confirmations), 10) > 10
        : false,
      input: transaction.input ?? '0x',
      status:
        transaction.status ||
        existingTransaction?.status ||
        TransactionStatus.inProgress,
      id: transaction.hash,
    };

    if (existingTransaction) {
      this.update(newTransaction.hash, newTransaction);
    } else {
      this.transactions.push(newTransaction);
    }

    return newTransaction;
  }

  update(id: string, params: Partial<IndexerTransaction>) {
    const transaction = this.getById(id);

    if (transaction) {
      this.transactions = this.transactions.map(t => {
        if (t.hash === transaction.hash) {
          return {...t, ...params};
        }
        return t;
      });
    }
  }

  getById(id: string) {
    const transactionLowerCaseId = id.toLowerCase();
    return (
      this.transactions.find(
        transaction =>
          transaction.hash.toLowerCase() === transactionLowerCaseId,
      ) || null
    );
  }

  getAll() {
    return this.transactions;
  }

  getAllByProviderId(providerId: string) {
    return this.transactions.filter(
      transaction => transaction.providerId === providerId,
    );
  }

  getAllByAccountIdAndProviderId(accountId: string, providerId: string) {
    const accountIdLowerCase = accountId.toLowerCase();
    return this.transactions.filter(
      ({providerId: pid, from, to}) =>
        pid === providerId &&
        (from === accountIdLowerCase || to === accountIdLowerCase),
    );
  }

  remove(id: string) {
    this.transactions = this.transactions.filter(
      transaction => transaction.hash !== id,
    );
  }

  removeAll() {
    this.transactions = [];
  }

  setConfirmed(id: string, receipt: TransactionReceipt) {
    const tx = this.getById(id);
    const txIndex = this.transactions.findIndex(({hash}) => hash === id);

    if (tx) {
      tx.confirmed = true;
      tx.fee = calcFee(
        receipt.effectiveGasPrice ?? DEFAULT_FEE,
        receipt.cumulativeGasUsed,
      );

      this.transactions.splice(txIndex, 1, tx);
    }
  }

  fetchNextTransactions = async (accounts: string[]) => {
    const accountHash = hashMessage(accounts.join(''));
    const isHashEquals = this.lastSyncedAccountsHash === accountHash;

    const lastTx = this.transactions[this.transactions.length - 1];
    const blockNumber = isHashEquals && lastTx ? `${lastTx.block}` : 'latest';

    if (isHashEquals && blockNumber === this.lastSyncedBlockNumber) {
      return this.transactions;
    }

    const nextTxs = await this.fetchAndMapTransactions(accounts, blockNumber);

    runInAction(() => {
      this.transactions = [...this.transactions, ...nextTxs];
    });

    return nextTxs;
  };

  fetchTransactions = async (accounts: string[]) => {
    const newTxs = await this.fetchAndMapTransactions(accounts);

    runInAction(() => {
      this.transactions = newTxs;
    });
    return newTxs;
  };

  private fetchAndMapTransactions = async (
    accounts: string[],
    blockNumber = 'latest',
  ) => {
    try {
      this.lastSyncedAccountsHash = hashMessage(accounts.join(''));
      this.lastSyncedBlockNumber = blockNumber;

      const txs = await Indexer.instance.getTransactions(accounts, blockNumber);

      const result = txs.map(migrateTransaction);
      Logger.log(
        'TransactionStore',
        'fetchAndMapTransactions',
        JSON.stringify({blockNumber, accounts, result}, null, 2),
      );
      return result;
    } catch (e) {
      Logger.captureException(e, 'TransactionStore.fetchAndMapTransactions');
      return [];
    }
  };
}

const instance = new IndexerTransactionStore(
  Boolean(process.env.JEST_WORKER_ID),
);

export {instance as IndexerTransaction};
