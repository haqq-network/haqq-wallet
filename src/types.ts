import React from 'react';

import {Validator} from '@evmos/provider';
import {Coin} from '@evmos/transactions';
import type {StackNavigationOptions} from '@react-navigation/stack';
import {ImageStyle, TextStyle, ViewStyle} from 'react-native';

import {Color} from '@app/colors';
import {I18N} from '@app/i18n';
import {Provider} from '@app/models/provider';
import {Wallet} from '@app/models/wallet';

import {Transaction} from './models/transaction';

export interface TransportWallet {
  getCosmosAddress: () => string;
  getPublicKey: () => Promise<string>;

  signTypedData: (domainHash: string, valueHash: string) => Promise<string>;
}

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
  providerId: string;
};

export type TransactionList =
  | TransactionListSend
  | TransactionListReceive
  | TransactionListDate;

export type WalletInitialData =
  | {
      mnemonic: string;
      privateKey: false;
    }
  | {
      mnemonic: false;
      privateKey: string;
    }
  | {
      address: string;
      deviceId: string;
      deviceName: string;
    };

export type RootStackParamList = {
  home: undefined;
  homeFeed: undefined;
  homeStaking: undefined;
  homeSettings:
    | undefined
    | {
        screen: keyof RootStackParamList;
        params: any;
      };
  homeGovernance: undefined;
  welcome: undefined;
  create: undefined;
  scanQr: undefined;
  signin: {next: string};
  signup: {next: string};
  restore: undefined;
  ledger: undefined;
  restorePhrase: {
    nextScreen: 'onboardingSetupPin' | 'restoreStore';
  };
  restoreStore: {
    nextScreen: NextScreenWithoutParamsT;
    mnemonic: string | false;
    privateKey: string | false;
  };
  register: undefined;
  backup: {
    address: string;
  };
  detailsQr: {address: string};
  settingsTheme: undefined;
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
    rootAddress: string;
    mnemonic: string;
  };
  backupFinish: undefined;
  backupCreate: {
    rootAddress: string;
    mnemonic: string;
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
    nextScreen: NextScreenWithoutParamsT;
  };
  onboardingBiometry: {
    biometryType: BiometryType;
    nextScreen?:
      | 'signupStoreWallet'
      | 'signinStoreWallet'
      | 'ledgerStoreWallet';
  } & WalletInitialData;
  onboardingRepeatPin: {
    currentPin: string;
    nextScreen?:
      | 'signupStoreWallet'
      | 'signinStoreWallet'
      | 'ledgerStoreWallet';
  } & WalletInitialData;
  onboardingSetupPin: WalletInitialData;
  onboardingFinish: undefined;
  signupStoreWallet: WalletInitialData;
  signinStoreWallet: WalletInitialData;
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
  ledgerStoreWallet: WalletInitialData;
  ledgerFinish: undefined;
  ledgerVerify: {
    nextScreen: 'ledgerStoreWallet' | 'onboardingSetupPin';
    address: string;
    deviceId: string;
    deviceName: string;
  };
  ledgerStore: {
    address: string;
    deviceId: string;
    deviceName: string;
  };
  proposalDepositForm: {
    account: string;
    proposalId: number;
    title: string;
  };
  proposalDepositPreview: {
    title: string;
    fee: number;
    account: string;
    amount: number;
    proposalId: number;
  };
  proposalDepositFinish: {
    title: string;
    fee: number;
    txhash: string;
    amount: number;
  };
  proposalDeposit: {
    proposalId: number;
    account: string;
  };
  settingsAccountEdit: {address: string};
  transactionContactEdit: {
    name: string;
    address: string;
  };
  settingsContactEdit: {
    name: string;
    address: string;
    isCreate?: boolean;
  };
  settingsProviderForm: {
    id?: string;
    data?: Partial<Provider>;
  };
  stakingValidators: undefined;
  stakingInfo: {
    validator: ValidatorItem;
  };
  stakingDelegate: {
    validator: string;
    selectedWalletAddress: string;
  };
  stakingDelegateAccount: {
    validator: ValidatorItem;
  };
  stakingDelegateForm: {
    account: string;
    validator: ValidatorItem;
  };
  stakingDelegatePreview: {
    account: string;
    amount: number;
    fee: number;
    validator: ValidatorItem;
  };
  stakingDelegateFinish: {
    txhash: string;
    validator: ValidatorItem;
    amount: number;
    fee: number;
  };
  stakingUnDelegate: {
    validator: string;
    selectedWalletAddress: string;
  };
  stakingUnDelegateAccount: {
    available: Wallet[];
    validator: ValidatorItem;
    maxAmount: number;
  };
  stakingUnDelegateForm: {
    account: string;
    validator: ValidatorItem;
    maxAmount: number;
  };
  stakingUnDelegatePreview: {
    account: string;
    amount: number;
    fee: number;
    validator: ValidatorItem;
  };
  stakingUnDelegateFinish: {
    txhash: string;
    validator: ValidatorItem;
    amount: number;
    fee: number;
  };
  notificationPopup: undefined;
  trackActivity: undefined;
  proposal: {
    id: number;
  };
};

export type StackPresentationTypes =
  | 'card'
  | 'modal'
  | 'transparentModal'
  | undefined;
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
  name: string | undefined;
};

export type NextScreenWithoutParamsT = {
  key: string;
  params?: undefined;
  merge?: boolean | undefined;
};

export type SwipeableAction<T> = {
  icon: React.ReactNode;
  backgroundColor: string;
  onPress: (item: T) => void;
  key: string;
};

export enum WalletCardStyle {
  flat = 'flat',
  gradient = 'gradient',
}

export enum WalletType {
  mnemonic = 'mnemonic',
  hot = 'hot',
  ledgerBt = 'ledger-bt',
}

export enum WalletCardPattern {
  circle = 'card-circle',
  rhombus = 'card-rhombus',
}

export type ActionSheetType = {
  presentation: PresentationNavigation;
  animation: 'fade' | 'flip' | 'default' | undefined;
  animationDuration: number;
};

export type PresentationNavigation =
  | 'card'
  | 'modal'
  | 'transparentModal'
  | undefined;

export type ScreenOptionType = StackNavigationOptions & {
  tab?: boolean;
  headerBackVisible?: boolean;
  headerBackHidden?: boolean | string;
};

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
  route?: {
    params: {
      address: string;
    };
  };
};

export type FontT = TextStyle | ViewStyle | ImageStyle | undefined;

export enum AppLanguage {
  en = 'en',
  ar = 'ar',
}

export enum AppTheme {
  light = 'light',
  dark = 'dark',
  system = 'system',
}

export type AddWalletParams = {address: string; publicKey: string} & (
  | {
      type: WalletType.mnemonic;
      mnemonic: string;
      path: string;
      privateKey: string;
      rootAddress: string;
    }
  | {
      type: WalletType.hot;
      privateKey: string;
    }
  | {
      type: WalletType.ledgerBt;
      deviceId: string;
      deviceName: string;
    }
);

export enum ValidatorStatus {
  active = I18N.validatorStatusActive,
  inactive = I18N.validatorStatusInactive,
  jailed = I18N.validatorStatusJailed,
}

export type ValidatorItem = Validator & {
  localStatus: ValidatorStatus;
  localDelegations?: number;
  localRewards?: number;
  localUnDelegations?: number;
};

export type ColorType = Color | string;

export type ProposalsTagKeys =
  | 'all'
  | 'voting'
  | 'deposited'
  | 'passed'
  | 'rejected';

export type VotesType = {
  yes: number;
  no: number;
  abstain: number;
  veto: number;
};

export type VoteNamesType = 'yes' | 'no' | 'abstain' | 'veto';

export type DepositResponse = {
  deposits: {
    proposal_id: string;
    depositor: string;
    amount: Coin[];
  }[];
  pagination: {next_key: any; total: string};
};

export type ProposalsCroppedList = {
  id: number;
  status: string;
}[];
