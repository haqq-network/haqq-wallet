export const Transaction = {
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
