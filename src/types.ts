import React from 'react';

import {Transaction} from './models/transaction';

import type {StackNavigationOptions} from '@react-navigation/stack';
import {ImageStyle, TextStyle, ViewStyle} from 'react-native';

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
  welcome: undefined;
  create: undefined;
  scanQr: undefined;
  signin: {next: string};
  signup: {next: string};
  setPin: undefined;
  restore: undefined;
  ledger: undefined;
  restorePhrase: {
    nextScreen: keyof RootStackParamList;
  };
  restoreStore: {
    mnemonic: string;
    privateKey: string | false;
    nextScreen: NextScreenT;
  };
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
  settingsProviders: undefined;
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
  backupWarning: {
    address: string;
  };
  createFinish: {
    action: string;
    hide: boolean;
  };
  createAgreement: {
    nextScreen: NextScreenT;
  };
  createStoreWallet: {
    nextScreen: NextScreenT;
  };
  onboardingBiometry: {
    biometryType: BiometryType;
    currentPin?: string;
    nextScreen?: 'backupNotification';
    address?: string;
  };
  onboardingRepeatPin: {
    biometryType?: BiometryType;
    currentPin: string;
    nextScreen?: 'onboardingBiometry';
  };
  onboardingSetupPin: {
    mnemonic: string | false;
    privateKey: string | false;
  };
  onboardingFinish: undefined;
  signupStoreWallet: {
    currentPin: string;
    biometryType: BiometryType;
  };
  signinAgreement: {
    nextScreen: {
      key: string;
      params?: {currentPin: string; biometryType: BiometryType};
    };
  };
  signinRestoreWallet: {
    nextScreen?: string;
  };
  transaction: {
    from?: string | boolean;
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
  transactionFinishDetails: {
    hash: string;
  };
  transactionConfirmation: {
    from: string;
    to: string;
    amount: number;
    splittedTo: string[];
    fee?: number;
  };
  transactionLedger: {
    from: string;
    to: string;
    amount: number;
    fee?: number;
  };
  transactionSumAddress: {
    to: string;
    event: string;
  };
  transactionAddress: {
    from: string;
    to?: string;
  };
  ledgerAgreement: undefined;
  ledgerBluetooth: undefined;
  ledgerScan: undefined;
  ledgerAccounts: {
    deviceId: string;
    deviceName: string;
  };
  ledgerFinish: {
    hide?: boolean;
  };
  ledgerVerify: {
    address: string;
    deviceId: string;
    deviceName: string;
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

export enum WalletType {
  hot = 'hot',
  ledgerBt = 'ledger-bt',
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
  headerBackHidden?: boolean | string;
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

export type RoutePropT = {
  route: {
    params: {
      address: string;
    };
  };
};

export type FontT = TextStyle | ViewStyle | ImageStyle | undefined;
