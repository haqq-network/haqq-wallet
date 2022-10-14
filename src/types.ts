import React from 'react';

import {Transaction} from './models/transaction';

import type {StackNavigationOptions} from '@react-navigation/stack';

export enum TransactionSource {
  unknown,
  date,
  send,
  receive,
}

export type TransactionListSend = Transaction & {
  source: TransactionSource.send;
};

export type TransactionListReceive = Transaction & {
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
  signin: {next: string};
  signup: {next: string};
  setPin: undefined;
  restore: undefined;
  register: undefined;
  backup: {
    address: string;
  };

  importWallet: undefined;
  details: {address: string};
  detailsQr: {address: string};
  settingsTest: undefined;
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
  backupVerify: {
    address: string;
  };
  backupFinish: undefined;
  backupCreate: {
    address: string;
  };
  backupNotification: {
    address: string;
  };
  ['onboarding-biometry']: {
    currentPin: string;
    biometryType: BiometryType;
  };
  createFinish: {
    action: string;
    hide: boolean;
  };
  ['onboarding-repeat-pin']: {
    currentPin: string;
    nextScreen: string;
    biometryType: BiometryType;
  };
  ['onboarding-setup-pin']: {
    mnemonic: string | false;
    privateKey: string | false;
  };
  signupStoreWallet: {
    nextScreen: string;
    biometryType?: BiometryType;
  };
  signinAgreement: {
    nextScreen: string;
  };
  signinRestoreWallet: {
    nextScreen: string;
  };
  onboardingFinish: undefined;
  createStoreWallet: undefined;
  transaction:
    | undefined
    | {
        from?: string;
        to?: string;
      };
  transactionDetail: {
    hash: string;
  };
  transactionAccount: {
    from: string;
  };
  transactionSum: {
    from: string;
    to: string;
  };
  transactionFinish: {
    hash: string;
  };
  transactionConfirmation: {
    from: string;
    to: string;
    amount: number;
    splittedTo: string[];
  };
  transactionSumAddress: {
    to: string;
    event: string;
  };
  transactionAddress: {
    from: string;
  };
};

export type IconsName = 'face-id' | 'arrow-back' | 'clear' | 'touch-id';
export type IconName = 'Face ID';

export enum BiometryType {
  faceId = 'FaceID',
  touchId = 'TouchID',
  fingerprint = 'Fingerprint',
  unknown = 'unknown',
}

export type Mnemonic = {
  phrase: string;
  path: string;
  locale: string;
};

export type NextScreenT = {
  key: string;
  params?: {currentPin: string; biometryType: BiometryType} | undefined;
  merge?: boolean | undefined;
};

export type SwipeableAction<T> = {
  icon: React.ReactNode;
  backgroundColor: string;
  onPress: (item: T) => void;
  key: string;
};

export enum WalletCardStyle {
  defaultGreen = 'defaultGreen',
  defaultYellow = 'defaultYellow',
  defaultBlue = 'defaultBlue',
  defaultBlack = 'defaultBlack',
  defaultViolet = 'defaultViolet',
  flat = 'flat',
  gradient = 'gradient',
}

export enum WalletCardPattern {
  circle = 'card-circle',
  rhombus = 'card-rhombus',
}

export type ActionSheetType = {
  presentation: 'card' | 'modal' | 'transparentModal' | undefined;
  animation: 'fade' | 'flip' | 'default' | undefined;
  animationDuration: number;
};

export interface ScreenOptionType extends StackNavigationOptions {
  tab?: boolean;
  headerBackVisible?: boolean;
  headerBackHidden?: boolean;
}

export type HeaderButtonProps = {
  tintColor?: string;
  pressColor?: string;
  pressOpacity?: number;
  canGoBack?: boolean;
  route?: {
    params: {
      address: string;
    };
  };
};
