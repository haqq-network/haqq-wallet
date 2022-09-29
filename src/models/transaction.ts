import {TransactionSource} from '../types';
import {cleanNumber} from '../utils';

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
    },
    primaryKey: 'hash',
  };

  get source() {
    return this.account.toLowerCase() === this.from.toLowerCase()
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
    return cleanNumber(this.fee.toFixed(8));
  }
}
