import React from 'react';

import {Validator} from '@evmos/provider';
import {Proposal} from '@evmos/provider/dist/rest/gov';
import {Coin} from '@evmos/transactions';
import type {StackNavigationOptions} from '@react-navigation/stack';
import {SessionTypes} from '@walletconnect/types';
import {ImageStyle, TextStyle, ViewStyle} from 'react-native';
import {Results} from 'realm';

import {Color} from '@app/colors';
import {IconProps} from '@app/components/ui';
import {I18N} from '@app/i18n';
import {Provider} from '@app/models/provider';
import {Wallet} from '@app/models/wallet';

import {CaptchaType} from './components/captcha';
import {Transaction} from './models/transaction';
import {SssProviders} from './services/provider-sss';
import {WalletConnectApproveConnectionEvent} from './types/wallet-connect';

export enum AdjustEvents {
  accountCreated = 'q3vxmg',
  accountAdded = 'tgdgp7',
  accountImported = 'iwqq4g',
  accountRestored = '2bsnz9',
  backupCompleted = '370jwc',
  sendFund = '44vsd8',
  pushNotifications = '2x889j',
  pushChannelSubscribe = '5juk3x',
  pushChannelUnsubscribe = 'za2nkc',
  newsOpenItem = 'gpha6n',
  newsScrolledItem = 'egpogy',
  newsOpen = 'dh3eeu',
  earnOpen = '9tn1b8',
  browserOpen = 'q77dcs',
  governanceOpen = 'txvtb0',
  settingsOpen = '450fpt',
  settingsAccountDetails = 'xbxrpy',
  stakingOpen = 'lzf6ty',
  stakingDelegate = 'xh19jh',
  stakingValidators = 'ejspf6',
}

export enum TransactionSource {
  unknown,
  date,
  send,
  receive,
}

export enum PopupNotificationBannerTypes {
  notification = 'notification',
}

export type PopupNotificationBannerId = string | PopupNotificationBannerTypes;

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
      type: 'sss';
      sssPrivateKey: string | null;
      sssCloudShare: string | null;
      verifier: string;
      token: string;
    }
  | {type: 'empty'};

export type RootStackParamList = {
  home: undefined;
  homeFeed: undefined;
  homeStaking: undefined;
  staking: undefined;
  web3browser: {
    url: string;
    popup?: boolean;
  };
  web3BrowserPopup: RootStackParamList['web3browser'];
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
  homeEarn: undefined;
  raffleDetails: {
    item: Raffle;
    prevIslmCount: number;
    prevTicketsCount: number;
  };
  raffleReward: {
    item: Raffle;
  };
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

  sssMigrate: {
    accountId: string;
  };
  sssMigrateAgreement: {
    accountId: string;
  };
  sssMigrateNetworks: {
    accountId: string;
  };
  sssMigrateFinish: undefined;
  sssMigrateStore: {
    accountId: string;
    privateKey: string | null;
    verifier: string;
    token: string;
  };

  sssMigrateRewrite: {
    accountId: string;
    privateKey: string;
    provider: SssProviders;
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
  settingsNotification: undefined;
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
  backupSssNotification: {
    accountId: string;
  };
  backupSssSuggestion: {
    accountId: string;
  };
  backupWarning: {
    accountId: string;
  };
  createFinish: {
    action: string;
    hide: boolean;
    event: AdjustEvents;
    onboarding?: boolean;
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
  signinNotExists: {provider: SssProviders; email?: string} & WalletInitialData;
  signinNotRecovery: WalletInitialData;
  signupNetworkExists: {
    provider: SssProviders;
    email?: string;
  } & WalletInitialData;
  signinNetworks: undefined;
  signinAgreement: undefined;
  signinRestoreWallet: undefined;
  transaction: {
    from?: string | boolean;
    to?: string;
    nft?: NftItem;
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
  transactionNftFinish: {
    hash: string;
    nft: NftItem;
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
  transactionNftConfirmation: {
    from: string;
    to: string;
    nft: NftItem;
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
    nft?: NftItem;
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
    proposal: Proposal;
  };
  proposalDepositPreview: {
    fee: number;
    account: string;
    amount: number;
    proposal: Proposal;
  };
  proposalDepositFinish: {
    proposal: Proposal;
    fee: number;
    txhash: string;
    amount: number;
  };
  proposalDeposit: {
    proposal: Proposal;
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
  popupNotification: {
    bannerId: PopupNotificationBannerId;
  };
  popupNotificationNews: {
    bannerId: PopupNotificationBannerId;
  };
  popupTrackActivity: {
    bannerId: string;
  };
  proposal: {
    proposal: Proposal;
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
  sssNetwork: undefined;
  sssBackup: {
    privateKey: string;
  };
  sssStoreWallet: {
    privateKey: string;
    cloudShare: string | null;
    questionAnswer: string | null;
    token: string;
    verifier: string;
  };
  sssFinish: undefined;
  walletProtectionPopup: {
    accountId: string;
  };
  newsDetail: {
    id: string;
  };
  news: undefined;
  governance: undefined;
  nftDetails:
    | ({
        type: 'nft';
      } & RootStackParamList['nftItemDetails'])
    | ({
        type: 'collection';
      } & RootStackParamList['nftCollectionDetails']);
  nftCollectionDetails: {
    item: NftCollection;
  };
  nftItemDetails: {
    item: NftItem;
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
  sss = 'sss',
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
  | '*'
  | 'PROPOSAL_STATUS_VOTING_PERIOD'
  | 'PROPOSAL_STATUS_DEPOSIT_PERIOD'
  | 'PROPOSAL_STATUS_PASSED'
  | 'PROPOSAL_STATUS_REJECTED'
  | 'PROPOSAL_STATUS_FAILED'
  | 'PROPOSAL_STATUS_UNSPECIFIED';

export type VotesType = Record<VoteNamesType, number>;

export type VoteNamesType = 'yes' | 'no' | 'abstain' | 'no_with_veto';

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

export interface RemoteMessage {
  data: Record<string, any>;
  from: string;
  messageId: string;
  notification: {body: string; title: string};
}

export type NewsRow = {
  id: string;
  title: string;
  preview: string;
  description: string;
  content: string;
  status: string;
  published_at: string;
  updated_at: string;
  created_at: string;
};

export enum RaffleStatus {
  open = 'open',
  closed = 'closed',
  unknown = 'unknown',
  created = 'created',
}

export type Raffle = {
  id: string;
  title: string;
  description: string;
  budget: string;
  status: RaffleStatus;
  winners: number;
  close_at: number;
  start_at: number;
  total_tickets: number;
  winner_tickets: number;
  locked_until: number;
};

export enum TimerUpdateInterval {
  second = 1000,
  minute = 1000 * 60,
  hour = 1000 * 60 * 60,
  day = 1000 * 60 * 60 * 24,
}

export type ModalsListBase = Record<string, object | undefined>;

export type ErrorModalImage =
  | {
      icon: IconProps['name'];
      color: IconProps['color'];
    }
  | {
      image: string;
    }
  | {};

export type Modals = {
  splash: undefined;
  pin: undefined;
  noInternet: {showClose?: boolean};
  loading: {
    text?: string;
  };
  error: {
    onClose?: () => void;
    title: string;
    description?: string;
    close: string;
  } & ErrorModalImage;
  qr: {
    onClose?: () => void;
    qrWithoutFrom?: boolean;
  };
  cardDetailsQr: {
    address: string;
    onClose?: () => void;
  };
  bluetoothPoweredOff: {
    onClose?: () => void;
  };
  bluetoothUnauthorized: {
    onClose?: () => void;
  };
  domainBlocked: {
    onClose?: () => void;
    domain: string;
  };
  ledgerNoApp: {
    onClose?: () => void;
    onRetry: () => Promise<void>;
  };
  ledgerAttention: {
    onClose?: () => void;
  };
  ledgerLocked: {
    onClose?: () => void;
  };
  errorAccountAdded: {
    onClose?: () => void;
  };
  errorCreateAccount: {
    onClose?: () => void;
  };
  claimOnMainnet: {
    onClose?: () => void;
    onChange: () => void;
    network: string;
  };
  walletsBottomSheet: {
    onClose?: () => void;
    wallets: Wallet[] | Results<Wallet>;
    closeDistance?: number;
    title: I18N;
    eventSuffix?: string;
    autoSelectWallet?: boolean;
  };
  transactionError: {
    onClose?: () => void;
    message?: string;
  };
  locationUnauthorized: {
    onClose?: () => void;
  };
  providersBottomSheet: {
    onClose?: () => void;
    title: I18N;
    providers: Provider[] | Results<Provider>;
    initialProviderId: string;
    closeDistance?: number;
    eventSuffix?: string;
  };
  captcha: {
    onClose?: () => void;
    variant?: CaptchaType;
  };
};

export interface NftAttribute {
  trait_type: string;
  value: string;
  frequency: number;
}

export interface NftItem {
  address: string;
  name: string;
  description: string;
  image: string;
  external_link: string;
  attributes: NftAttribute[];
  last_sale_price: string;
  owner_address: string;
}

export interface NftCollection {
  address: string;
  name: string;
  description: string;
  image: string;
  external_link: string;
  items: NftItem[];
  created_at: number;
}
