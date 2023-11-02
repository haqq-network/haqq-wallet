import {TransactionReceipt} from '@ethersproject/abstract-provider';
import {utils} from 'ethers';
import {makeAutoObservable, when} from 'mobx';
import {isHydrated, makePersistable} from 'mobx-persist-store';

import {calcFee} from '@app/helpers';
import {awaitForRealm} from '@app/helpers/await-for-realm';
import {realm} from '@app/models/index';
import {Balance} from '@app/services/balance';
import {storage} from '@app/services/mmkv';
import {HaqqEthereumAddress, MobXStoreFromRealm} from '@app/types';
import {DEFAULT_FEE, STORE_REHYDRATION_TIMEOUT_MS} from '@app/variables/common';

export enum TransactionStatus {
  failed,
  success,
  inProgress,
}

export type Transaction = {
  account: string;
  raw: string;
  fee: number;
  feeHex: string;
  providerId: string;
  hash: string;
  block?: string;
  from: HaqqEthereumAddress;
  to: HaqqEthereumAddress;
  value: number;
  chainId: string | number;
  timeStamp?: number | string;
  createdAt: number;
  confirmations?: number | string;
  contractAddress: string | null;
  confirmed: boolean;
  input: string;
  status: TransactionStatus;
};

export class TransactionRealmObject extends Realm.Object {
  static schema = {
    name: 'Transaction',
    properties: {
      hash: 'string',
      block: 'string?',
      account: 'string',
      raw: 'string',
      from: 'string',
      to: 'string?',
      contractAddress: 'string?',
      value: 'double',
      fee: 'double',
      createdAt: {type: 'date', default: () => new Date()},
      confirmed: {type: 'bool', default: false},
      providerId: 'string',
      chainId: 'string',
      feeHex: 'string',
      input: 'string',
    },
    primaryKey: 'hash',
  };
}

class TransactionStore implements MobXStoreFromRealm {
  realmSchemaName = TransactionRealmObject.schema.name;
  transactions: Transaction[] = [];

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

  create(
    transaction: Transaction,
    providerId: string,
    fee: Balance = Balance.Empty,
  ) {
    const existingTransaction = this.getById(transaction.hash.toLowerCase());
    const newTransaction: Transaction = {
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
    };

    if (existingTransaction) {
      this.update(newTransaction.hash, newTransaction);
    } else {
      this.transactions.push(newTransaction);
    }

    return newTransaction;
  }

  update(id: string, params: Partial<Transaction>) {
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
}

const instance = new TransactionStore(Boolean(process.env.JEST_WORKER_ID));
export {instance as Transaction};
