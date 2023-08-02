import {TransactionReceipt} from '@ethersproject/abstract-provider';
import {BigNumber} from '@ethersproject/bignumber';
import {utils} from 'ethers';

import {calcFee} from '@app/helpers';
import {realm} from '@app/models/index';

export class Transaction extends Realm.Object {
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
    },
    primaryKey: 'hash',
  };
  hash!: string;
  block: string;
  account!: string;
  raw!: string;
  from!: string;
  to: string;
  contractAddress: string;
  value!: number;
  fee!: number;
  createdAt!: Date;
  confirmed!: boolean;
  providerId!: string;
  chainId!: string;

  get feeFormatted() {
    return this.fee.toFixed(15);
  }

  static getAll() {
    return realm.objects<Transaction>(Transaction.schema.name);
  }

  static remove(id: string) {
    const obj = Transaction.getById(id);

    if (obj) {
      realm.write(() => {
        realm.delete(obj);
      });
    }
  }

  static getById(id: string) {
    return realm.objectForPrimaryKey<Transaction>(Transaction.schema.name, id);
  }

  static getAllByProviderId(providerId: string) {
    return realm
      .objects<Transaction>(Transaction.schema.name)
      .filtered('providerId == $0', providerId);
  }

  static getAllByAccountIdAndProviderId(accountId: string, providerId: string) {
    return realm
      .objects<Transaction>(Transaction.schema.name)
      .filtered(
        'providerId == $0 && ( from == $1 || to == $1 )',
        providerId,
        accountId.toLowerCase(),
      );
  }

  static removeAll() {
    const transactions = realm.objects<Transaction>(Transaction.schema.name);

    realm.write(() => {
      realm.delete(transactions);
    });
  }

  static create(
    transaction: {
      hash: string;
      block?: string;
      from: string;
      to?: string;
      value: BigNumber;
      chainId: string | number;
      timeStamp?: number | string;
      confirmations?: number | string;
      contractAddress?: string;
    },
    providerId: string,
    fee: number = 0,
  ) {
    const exists = Transaction.getById(transaction.hash.toLowerCase());

    realm.write(() => {
      realm.create(
        Transaction.schema.name,
        {
          ...exists?.toJSON(),
          hash: transaction.hash.toLowerCase(),
          block: transaction.block,
          account: transaction.from.toLowerCase(),
          raw: JSON.stringify(transaction),
          from: transaction.from.toLowerCase(),
          to: transaction.to ? transaction.to.toLowerCase() : null,
          contractAddress: transaction.contractAddress
            ? transaction.contractAddress.toLowerCase()
            : null,
          value: parseFloat(utils.formatEther(transaction.value)),
          fee: fee,
          providerId,
          chainId: String(transaction.chainId),
          createdAt: exists
            ? exists.createdAt
            : transaction.timeStamp &&
              new Date(parseInt(String(transaction.timeStamp), 10) * 1000),
          confirmed: transaction.confirmations
            ? parseInt(String(transaction.confirmations), 10) > 10
            : false,
        },
        Realm.UpdateMode.Modified,
      );
    });

    return transaction.hash;
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
      Logger.captureException(e, 'Transaction.setConfirmed', {
        receipt: JSON.stringify(receipt),
      });
    }
  }
}
