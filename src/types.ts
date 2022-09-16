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
  create: undefined;
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
  transactionDetail: {
    hash: string;
  };
  importWallet: undefined;
  details: {address: string};
  detailsQr: {address: string};
  backupNotification: undefined;
  settingsAccounts: undefined;
  settingsAccountDetail: {address: string};
  settingsAccountStyle: {address: string};
  settingsAddressBook: undefined;
  settingsLanguage: undefined;
  settingsSecurity: undefined;
  settingsSecurityPin: undefined;
  settingsSecurityPinRepeat: {
    pin: string;
  };
  settingsFaq: undefined;
  settingsAbout: undefined;
};

export type BiometryType = 'FaceID' | 'TouchID' | null;
