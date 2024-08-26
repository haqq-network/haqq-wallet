export class ContactRealmObject extends Realm.Object {
  static schema = {
    name: 'Contact',
    properties: {
      account: 'string',
      name: 'string',
      type: 'string',
      visible: 'bool',
    },
    primaryKey: 'account',
  };
}

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
