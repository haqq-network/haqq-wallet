export const TransactionSchema = {
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

export type TransactionType = {
  hash: string;
  account: string;
  raw: string;
  from: string;
  to: string;
  value: number;
  fee: number;
  createdAt: Date;
  confirmed: boolean;
};
