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
}
