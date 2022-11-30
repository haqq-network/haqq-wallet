import {
  TransactionReceipt,
  TransactionResponse,
} from '@ethersproject/abstract-provider';
import {utils} from 'ethers';

import {calcFee, captureException} from '@app/helpers';

import {TransactionSource} from '../types';
import {cleanNumber} from '../utils';
import {realm} from './index';

export class Transaction extends Realm.Object {
  hash!: string;
  account!: string;
  raw!: string;
  from!: string;
  to!: string;
  value!: number;
  fee!: number;
  createdAt!: Date;
  confirmed!: boolean;
  providerId!: string;

  static schema = {
    name: 'Transaction',
    properties: {
      hash: 'string',
      account: 'string',
      raw: 'string',
      from: 'string',
      to: 'string',
      value: 'double',
      fee: 'double',
      createdAt: 'date',
      confirmed: 'bool',
      providerId: 'string',
    },
    primaryKey: 'hash',
  };

  get source() {
    return this.account.toLowerCase() === this.from.toLowerCase()
      ? TransactionSource.send
      : TransactionSource.receive;
  }

  getSourceForAccount(account: string) {
    return account === this.from.toLowerCase()
      ? TransactionSource.send
      : TransactionSource.receive;
  }

  get totalFormatted() {
    if (this.source === TransactionSource.send) {
      return `- ${cleanNumber((this.value + this.fee).toFixed(8))}`;
    }

    return `+ ${cleanNumber(this.value.toFixed(8))}`;
  }

  get valueFormatted() {
    return cleanNumber(this.value.toFixed(8));
  }

  get feeFormatted() {
    return this.fee.toFixed(15);
  }

  setConfirmed(receipt: TransactionReceipt) {
    try {
      realm.write(() => {
        this.confirmed = true;
        this.fee = calcFee(
          receipt.effectiveGasPrice ?? 7,
          receipt.cumulativeGasUsed,
        );
      });
    } catch (e) {
      captureException(e, 'Transaction.setConfirmed', {
        receipt: JSON.stringify(receipt),
      });
    }
  }

  static createTransaction(
    transaction: TransactionResponse,
    providerId: string,
    fee: number = 0,
  ) {
    realm.write(() => {
      realm.create('Transaction', {
        hash: transaction.hash,
        account: transaction.from,
        raw: JSON.stringify(transaction),
        createdAt: new Date(),
        from: transaction.from,
        to: transaction.to,
        value: parseFloat(utils.formatEther(transaction.value)),
        fee: fee,
        confirmed: false,
        providerId,
      });
    });
  }
}
