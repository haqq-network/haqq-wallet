import {TransactionType} from './models/transaction';

export enum TransactionSource {
  unknown,
  date,
  send,
  receive,
}

export type TransactionListSend = TransactionType & {
  source: TransactionSource.send;
};

export type TransactionListReceive = TransactionType & {
  source: TransactionSource.receive;
};

export type TransactionListDate = {
  hash: string;
  date: Date;
  source: TransactionSource.date;
};

export type TransactionList =
  | TransactionListSend
  | TransactionListReceive
  | TransactionListDate;

export type RootStackParamList = {
  home: undefined;
  login: undefined;
  scanQr: undefined;
  signin: undefined;
  signup: undefined;
  setPin: undefined;
  restore: undefined;
  register: undefined;
  backup: {
    address: string;
  };
  transaction:
    | undefined
    | {
        from: string;
      };
  importWallet: undefined;
  details: {address: string};
  detailsQr: {address: string};
};
