import React from 'react';

import {Validator} from '@evmos/provider';
import {Coin} from '@evmos/transactions';
import type {StackNavigationOptions} from '@react-navigation/stack';
import {SessionTypes} from '@walletconnect/types';
import {ImageStyle, TextStyle, ViewStyle} from 'react-native';
import {Results} from 'realm';

import {Color} from '@app/colors';
import {I18N} from '@app/i18n';
import {Provider} from '@app/models/provider';
import {Wallet} from '@app/models/wallet';

import {Transaction} from './models/transaction';
import {MpcProviders} from './services/provider-mpc';
import {WalletConnectApproveConnectionEvent} from './types/wallet-connect';

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
      type: 'mnemonic';
      mnemonic: string;
    }
  | {
      type: 'privateKey';
      privateKey: string;
    }
  | {
      type: 'ledger';
      address: string;
      deviceId: string;
      deviceName: string;
    }
  | {
      type: 'mpc';
      mpcPrivateKey: string | null;
      mpcCloudShare: string | null;
      verifier: string;
      token: string;
    }
  | {type: 'empty'};

export type RootStackParamList = {
  home: undefined;
  homeFeed: undefined;
  homeStaking: undefined;
  web3browser: {
    url: string;
  };
  browserHomePage: undefined;
  browserSearchPage: undefined | {initialSearchText?: string};
  browserEditBookmarksScreen: undefined;
  homeBrowser:
    | undefined
    | {
        screen: 'web3browser';
        params: {
          url: string;
        };
      }
    | {
        screen: 'browserSearchPage';
        params: undefined | {initialSearchText?: string};
      }
    | {
        screen:
          | 'browserSearchPage'
          | 'browserEditBookmarksScreen'
          | 'browserHomePage';
      };
  homeSettings:
    | undefined
    | {
        screen: 'settingsProviderForm';
        params: RootStackParamList['settingsProviderForm'];
      };
  homeGovernance: undefined;
  accountInfo: {
    accountId: string;
  };
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
  } & WalletInitialData;
  register: undefined;
  backup: {
    accountId: string;
  };

  mpcMigrate: {
    accountId: string;
  };
  mpcMigrateAgreement: {
    accountId: string;
  };
  mpcMigrateNetworks: {
    accountId: string;
  };
  mpcMigrateFinish: undefined;
  mpcMigrateStore: {
    accountId: string;
    privateKey: string;
    verifier: string;
    token: string;
  };

  mpcMigrateRewrite: {
    accountId: string;
    privateKey: string;
    provider: MpcProviders;
    email?: string;
    verifier: string;
    token: string;
  };
  detailsQr: {address: string};
  settingsTheme: undefined;
  settingsTest: undefined;
  settingsAccounts: undefined;
  settingsAccountDetail: {address: string};
  settingsAccountStyle: {address: string};
  settingsAddressBook: undefined;
  settingsLanguage: undefined;
  settingsSecurityPin: undefined;
  settingsProviders: undefined;
  settingsSecurityPinRepeat: {
    pin: string;
  };
  settingsFaq: undefined;
  settingsAbout: undefined;
  backupVerify: {
    accountId: string;
  };
  backupFinish: undefined;
  backupCreate: {
    accountId: string;
  };
  backupNotification: {
    accountId: string;
  };
  backupMpcNotification: {
    accountId: string;
  };
  backupMpcSuggestion: {
    accountId: string;
  };
  backupWarning: {
    accountId: string;
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
  } & WalletInitialData;
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
  signupNetworks: undefined;
  signinPin: WalletInitialData;
  signupPin: WalletInitialData;
  signinNotExists: {provider: MpcProviders; email?: string} & WalletInitialData;
  signinNotRecovery: WalletInitialData;
  signupNetworkExists: {
    provider: MpcProviders;
    email?: string;
  } & WalletInitialData;
  signinNetworks: undefined;
  signinAgreement: undefined;
  signinRestoreWallet: undefined;
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
    hdPath: string;
    publicKey: string;
    deviceId: string;
    deviceName: string;
  };
  ledgerStore: {
    address: string;
    hdPath: string;
    publicKey: string;
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
  settingsViewRecoveryPhrase: {
    accountId: string;
  };
  settingsSecurity: undefined;
  walletSelector: {
    wallets: Wallet[] | Results<Wallet>;
    title: string;
    initialAddress?: string;
    eventSuffix?: string;
  };
  walletConnect?: {
    screen: 'walletConnectApproval' | 'walletConnectSign';
    params: RootStackParamList['walletConnectApproval'];
  };
  walletConnectWalletList: undefined;
  walletConnectApplicationListPopup: RootStackParamList['walletConnectApplicationList'];
  walletConnectApplicationList: {
    address: string;
    isPopup?: boolean;
  };
  walletConnectApplicationDetailsPopup: RootStackParamList['walletConnectApplicationDetails'];
  walletConnectApplicationDetails: {
    session: SessionTypes.Struct;
    isPopup?: boolean;
  };
  walletConnectApproval: {
    event: WalletConnectApproveConnectionEvent;
  };
  jsonRpcSign: {
    request: PartialJsonRpcRequest;
    metadata: JsonRpcMetadata;
    chainId?: number;
    selectedAccount?: string;
  };
  mpcNetwork: undefined;
  mpcBackup: {
    privateKey: string;
  };
  mpcStoreWallet: {
    privateKey: string;
    cloudShare: string | null;
    questionAnswer: string | null;
    token: string;
    verifier: string;
  };
  mpcFinish: undefined;
  walletProtectionPopup: {
    accountId: string;
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
  mpc = 'mpc',
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
  route?: {
    params: {
      accountId: string;
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

export type AddWalletParams = {
  address: string;
  accountId: string;
  path: string;
  type: WalletType;
};

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
  searchString?: string;
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

export type StakingParamsResponse = {
  params: {
    unbonding_time: string;
    max_validators: number;
    max_entries: number;
    historical_entries: number;
    bond_denom: string;
  };
};

export type ProposalsCroppedItem = {
  id: number;
  status: string;
  title: string;
};

export type ProposalsCroppedList = ProposalsCroppedItem[];

export type LedgerAccountItem = {
  address: string;
  hdPath: string;
  publicKey: string;
  exists: boolean;
  balance: number;
};

export interface WalletConnectParsedAccount {
  // eg '0x7ee0375a10acc7d0e3cdf1c21c9409be7a9dff7b'
  address: string;
  // eg 'eip155'
  namespace?: string;
  // eg '5'
  networkId?: string;
}

export interface Link {
  id: string;
  url: string;
  title: string;
  icon?: string;
}

export interface DynamicLink {
  url: string;
  minimumAppVersion: number | string | null;
  utmParameters: Record<string, string>;
}

export type PartialJsonRpcRequest = {
  method: string;
  params?: any;
};

export type JsonRpcMetadata = {
  url: string;
  iconUrl?: string;
};

export interface EthType {
  [key: string]: string | EthType[];
}

export interface EthTypedData {
  domain: {
    [key: string]: string;
  };
  message: {
    [key: string]: any;
  };
  primaryType: string;
  types: {
    [key: string]: EthType;
  };
}
