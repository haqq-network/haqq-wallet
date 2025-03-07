import React from 'react';

import {BigNumber} from '@ethersproject/bignumber';
import {Validator} from '@evmos/provider';
import {Proposal} from '@evmos/provider/dist/rest/gov';
import {Coin} from '@evmos/transactions';
import {
  AccessListish,
  BigNumberish,
  KeystoneAwaitForSignParams,
  ProviderMnemonicBase,
  ProviderSSSBase,
  TypedDataTypesNames,
} from '@haqq/rn-wallet-providers';
import {FirebaseMessagingTypes} from '@react-native-firebase/messaging';
import {NativeStackNavigationOptions} from '@react-navigation/native-stack';
import {SessionTypes} from '@walletconnect/types';
import Decimal from 'decimal.js';
import {TypedDataField} from 'ethers';
import {
  ImageSourcePropType,
  ImageStyle,
  TextStyle,
  ViewStyle,
} from 'react-native';

import {Color} from '@app/colors';
import {CaptchaType} from '@app/components/captcha';
import {TotalValueTabNames} from '@app/components/total-value-info';
import {IconProps} from '@app/components/ui';
import {I18N} from '@app/i18n';
import {Banner} from '@app/models/banner';
import {NftCollection, NftItem} from '@app/models/nft';
import {ProviderModel} from '@app/models/provider';
import {BalanceModel, IWalletModel, WalletModel} from '@app/models/wallet';
import {SignUpStackRoutes, WelcomeStackRoutes} from '@app/route-types';
import {EthNetwork} from '@app/services';
import {Balance} from '@app/services/balance';
import {SssProviders} from '@app/services/provider-sss';
import {WalletConnectApproveConnectionEvent} from '@app/types/wallet-connect';
import {EIP155_SIGNING_METHODS} from '@app/variables/EIP155';

import {AwaitValue} from './helpers/await-for-value';
import {Fee} from './models/fee';
import {SecureValue} from './modifiers/secure-value';

export enum MarketingEvents {
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
  newsOpenLink = 'yjfbpz',
  newsScrolledItem = 'egpogy',

  newsOpenOnboardingItem = 'g75jnx',
  newsOpenOnboardingLink = 'ckc36g',
  newsScrolledOnboardingItem = 'iwcclq',

  newsOpenPushItem = '4v9swk',
  newsOpenPushLink = 'ytc8qf',
  newsScrolledPushItem = 'tdlgze',

  newsOpen = 'dh3eeu',
  earnOpen = '9tn1b8',
  browserOpen = 'q77dcs',
  governanceOpen = 'txvtb0',
  settingsOpen = '450fpt',
  claimOpened = '50vfgf',
  claimFetched = '6420g4',
  claimCreated = 'u4h7vr',
  claimFailed = 'iitz4i',
  settingsAccountDetails = 'xbxrpy',
  stakingOpen = 'lzf6ty',
  stakingDelegate = 'xh19jh',
  stakingValidators = 'ejspf6',
  jailed = 'k13htx',

  storyOpen = '1axuz5',
  storySkip = 'iejfyw',
  storyFinished = 'p3q1wh',
  storyAction = 'soh778',

  signTxStart = 'p4ddyo',
  signTxSuccess = 'qn67qh',
  signTxFail = 'u8jbr8',
  sendTxStart = '2u2yjy',
  sendTxSuccess = '31hbyi',
  sendTxFail = 'svkvy9',

  appStarted = 'w8hbt0',
  navigation = '68gzdc',

  bannerClicked = '9zjcys',

  swapStart = 'swapStart',
  swapSuccess = 'swapSuccess',
  swapFail = 'swapFail',

  swapScreenOpen = 'swapScreenOpen',
  swapSelectToken0 = 'swapSelectToken0',
  swapSelectToken1 = 'swapSelectToken1',
  swapEnterAmount = 'swapEnterAmount',
  swapPressMax = 'swapPressMax',
  swapChangeDirection = 'swapChangeDirection',

  swapApproveStart = 'swapApproveStart',
  swapApproveSuccess = 'swapApproveSuccess',
  swapApproveFail = 'swapApproveFail',

  jsonRpcSignStart = 'jsonRpcSignStart',
  jsonRpcSignSuccess = 'jsonRpcSignSuccess',
  jsonRpcSignFail = 'jsonRpcSignFail',
  jsonRpcSignUserReject = 'jsonRpcSignUserReject',
  swapScreenClose = 'swapScreenClose',

  exportWalletStart = 'exportWalletStart',
  exportWalletSuccess = 'exportWalletSuccess',
  exportWalletFail = 'exportWalletFail',
  installHaqqabi = 'installHaqqabi',
}

export enum PopupNotificationBannerTypes {
  notification = 'notification',
}

export type PopupNotificationBannerId = string | PopupNotificationBannerTypes;

export type TransactionResponse = Awaited<
  ReturnType<EthNetwork['transferTransaction']>
>;

export type SendTransactionRequest = Awaited<
  ReturnType<(typeof EthNetwork)['sendTransaction']>
>;

export type WalletInitialData =
  | {
      type: 'mnemonic';
      mnemonic: SecureValue<string>;
    }
  | {
      type: 'privateKey';
      privateKey: SecureValue<string>;
    }
  | {
      type: 'sss';
      sssPrivateKey: string | null;
      sssCloudShare: string | null;
      sssLocalShare: string | null;
      verifier: string;
      token: SecureValue<string>;
      action?: 'restore' | 'replace';
      provider: SssProviders;
    }
  | {type: 'empty'}
  | LedgerWalletInitialData;

export type LedgerWalletInitialData = {
  type: 'ledger';
  address: AddressEthereum;
  hdPath: string;
  publicKey: string;
  deviceId: string;
  deviceName: string;
};

export type KeystoneWalletInitialData = {
  type: 'keystone';
  address: AddressEthereum;
  hdPath: string;
  publicKey: string;
  qrCBORHex: string;
};

export type RootStackParamList = {
  chooseAccount:
    | (WalletInitialData & {provider: ProviderMnemonicBase})
    | {
        provider: ProviderSSSBase;
      };
  cloudProblems: {sssProvider: SssProviders; onNext: () => void};
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
  browserPrivacy: undefined;
  browserPrivacyDetails: {
    hostname: string;
  };
  browserPrivacyPopupStack: {
    screen: 'browserPrivacyDetails' | 'browserPrivacy';
    params?: RootStackParamList[RootStackParamList['browserPrivacyPopupStack']['screen']];
  };
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
  homeNews:
    | undefined
    | {
        id: string;
        openEvent: MarketingEvents;
        linkEvent: MarketingEvents;
        scrollEvent: MarketingEvents;
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
  totalValueInfo?: {
    tab?: TotalValueTabNames;
  };
  welcome: undefined;
  welcomeNews: undefined;
  create: undefined;
  scanQr: undefined;
  signin: {next: WelcomeStackRoutes};
  signup: {next: SignUpStackRoutes};
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
  networkLogger: undefined;
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
  settingsDeveloperTools: undefined;
  settingsAccounts: undefined;
  ourNews: undefined;
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
    wallet: IWalletModel;
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
    event: MarketingEvents;
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
  onboardingTrackUserActivity: {
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
  onboardingSetupPin: WalletInitialData & {errorText?: string};
  onboardingFinish: undefined;
  signupStoreWallet: WalletInitialData;
  signinStoreWallet: WalletInitialData;
  signupNetworks: undefined;
  signinPin: WalletInitialData;
  signupPin: WalletInitialData;
  signinNotExists: {provider: SssProviders; email?: string} & WalletInitialData;
  signinNotRecovery: WalletInitialData;
  signinNetworks: undefined;
  signinAgreement: undefined;
  signinRestoreWallet: undefined;
  transaction: {
    from?: string | boolean;
    to?: string;
    nft?: NftItem;
  };
  accountDetail: {
    address: string;
  };
  transactionDetail: {
    hash: string;
    contractName?: string;
  };
  inAppBrowser: {
    url: string;
    title?: string;
  };
  transactionAccount: {
    to: string;
  };
  transactionSelectCrypto: {from: string; to: string};
  transactionSum: {
    from: string;
    to: string;
    token: IToken;
  };
  transactionFinish: {
    transaction: TransactionResponse;
    hash: string;
    token: IToken;
    amount?: Balance;
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
    amount: Balance;
    fee?: Balance;
    token: IToken;
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
    amount: Balance;
    fee?: Balance;
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
    fee: Balance;
    account: string;
    amount: number;
    proposal: Proposal;
  };
  proposalDepositFinish: {
    proposal: Proposal;
    fee: Balance;
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
    data?: Partial<ProviderModel>;
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
    fee: Balance;
    validator: ValidatorItem;
  };
  stakingDelegateFinish: {
    txhash: string;
    validator: ValidatorItem;
    amount: number;
    fee: Balance;
  };
  stakingUnDelegate: {
    validator: string;
    selectedWalletAddress: string;
  };
  stakingUnDelegateAccount: {
    available: IWalletModel[];
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
    fee: Balance;
    validator: ValidatorItem;
  };
  stakingUnDelegateFinish: {
    txhash: string;
    validator: ValidatorItem;
    amount: number;
    fee: Balance;
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
    type: WalletType;
  };
  settingsSecurity: undefined;
  walletSelector: Eventable & {
    wallets: IWalletModel[];
    title: string;
    initialAddress?: string;
    chainId?: ChainId;
  };
  valueSelector: {
    title: string;
    values: AwaitValue[];
    initialIndex?: number;
    eventSuffix?: string;
    closeOnSelect?: boolean;
    renderCell?: (
      value: any,
      idx: number,
      onPress: (value: any, idx: number) => void,
    ) => React.ReactNode;
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
    chainId?: ChainId;
    selectedAccount?: string;
    hideContractAttention?: boolean;
  };
  sssNetwork: undefined;
  sssBackup: {
    privateKey: string;
  };
  sssStoreWallet: {
    privateKey: string;
    cloudShare: string | null;
    localShare: string | null;
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
  newsDetailsPushNotification: {
    id: string;
    openEvent: MarketingEvents;
    linkEvent: MarketingEvents;
    scrollEvent: MarketingEvents;
  };
  feeSettings: {
    fee: Fee;
    from: string;
    to: string;
    value?: Balance;
    data?: string;
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

export type WalletCardStyleT = {
  cardStyle: WalletCardStyle;
  colorFrom: string;
  colorTo: string;
  colorPattern: string;
  pattern: string;
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
  keystone = 'keystone',
  watchOnly = 'watch-only',
}

export enum WalletCardPattern {
  circle = 'card-circle',
  rhombus = 'card-rhombus',
}

export type ActionSheetType = {
  presentation: PresentationNavigation;
  animation: 'fade' | 'flip' | 'default' | undefined;
  animationDuration: number;
  animationEnabled: boolean;
};

export type PresentationNavigation =
  | 'card'
  | 'modal'
  | 'transparentModal'
  | undefined;

export interface ScreenOptionType extends NativeStackNavigationOptions {
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
  tr = 'tr',
  id = 'id',
  ar = 'ar',
  // ru = 'ru',
}

export enum AppTheme {
  light = 'light',
  dark = 'dark',
  system = 'system',
}

export type AddWalletParams = {
  address: AddressEthereum;
  tronAddress?: AddressTron;
  accountId: string;
  path: string;
  type: WalletType;
  pattern?: string;
  cardStyle?: WalletCardStyle;
  colorFrom?: string;
  colorTo?: string;
  colorPattern?: string;
  socialLinkEnabled?: boolean;
  mnemonicSaved?: boolean;
  isImported?: boolean;
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
  power?: number;
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
  balance: Balance;
};

export type ChooseAccountItem = AddWalletParams & {
  balance: Balance;
  exists?: boolean;
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
  subtitle?: string;
  icon?: string;
  eventName?: string;
}

export interface DynamicLink {
  url: string;
  minimumAppVersion: number | string | null;
  utmParameters: Record<string, string>;
}

export type PartialJsonRpcRequest = {
  method: EIP155_SIGNING_METHODS | string;
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

export type RemoteMessage<TData = Record<string, any>> = Omit<
  FirebaseMessagingTypes.RemoteMessage,
  'data'
> & {
  data: TData;
};

export interface NewsUpdatesResponse {
  news: NewsRow[];
  rss_feed: RssNewsRow[];
  timestamp: Date;
}

export interface NewsRow {
  content: string;
  created_at: Date;
  description: string;
  id: string;
  preview: string;
  published_at: Date;
  status: NewsStatus;
  storyblok_slug: string;
  storyblok_space_id: string;
  storyblok_story_id: string;
  title: string;
  updated_at: Date;
}

export enum NewsStatus {
  published = 'published',
  unpublished = 'unpublished',
}

export enum RssNewsStatus {
  approved = 'approved',
  disapproved = 'disapproved',
  wait_for_review = 'wait_for_review',
  unknown = 'unknown',
}

export interface RssNewsRow {
  approves: string[];
  created_at: Date;
  description: string;
  disapproves: any[];
  id: string;
  preview: string;
  rss_source_id: string;
  status: RssNewsStatus;
  tg_channel_id: string;
  tg_message_id: string;
  title: string;
  updated_at: Date;
  url: string;
}

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
  locked_duration: number;
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

/**
 * @description When adding a new modal, popup, or bottom sheet,
 * ensure to declare the modal props, for example,
 * at `src/screens/settings-test.tsx` inside the `getTestModals` function.
 */
export type Modals = {
  splash: undefined;
  notEnoughGas: {
    gasLimit: Balance;
    currentAmount: Balance;
    onClose?: () => void;
  };
  pin: undefined;
  raffleAgreement: {
    onClose?: () => void;
  };
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
    eventTaskId?: string;
    /**
     * @description regex pattern to match the scanned data
     */
    pattern?: string;
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
  customProviderEmail: {
    onClose?: () => void;
    onChange: (email: string) => void;
  };
  walletsBottomSheet: Eventable & {
    onClose?: () => void;
    wallets: WalletModel[];
    closeDistance?: () => number;
    title: I18N;
    autoSelectWallet?: boolean;
    initialAddress?: string;
    hideBalance?: boolean;
    chainId?: ChainId;
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
    providers?: ProviderModel[];
    initialProviderChainId: ChainId;
    disableAllNetworksOption?: boolean;
    closeDistance?: () => number;
    eventSuffix?: string;
  };
  copyAddressBottomSheet: {
    wallet: WalletModel;
    eventSuffix?: string;
    onClose?: () => void;
    closeDistance?: () => number;
  };
  captcha: {
    onClose?: () => void;
    variant?: CaptchaType;
  };
  lockedTokensInfo: {
    onClose?: () => void;
  };
  cloudVerification: {
    sssProvider: SssProviders;
    showClose?: boolean;
  };
  viewErrorDetails: {
    errorId: string;
    errorDetails: string;
    onClose?: () => void;
  };
  cloudShareNotFound: {onClose?: () => void; wallet: IWalletModel};
  keystoneScanner: {
    purpose?: 'sign' | 'sync';
    eventTaskId?: string;
    onClose?: () => void;
  };
  keystoneQR: KeystoneAwaitForSignParams & {
    succesEventName: string;
    errorEventName: string;
    onClose?: () => void;
  };
  sssLimitReached: {onClose?: () => void};
  pinError: {
    details?: string;
    onClose?: () => void;
  };
  removeSSS: {
    onClose?: () => void;
    accountId: string;
    provider: 'cloud' | 'googleDrive';
  };
  popupNotification: {
    onCloseProp?: () => void;
  };
  info: {
    title: string;
    description?: string;
    onClose?: () => void;
  };
};

export enum ModalType {
  loading = 'loading',
  pin = 'pin',
  splash = 'splash',
  noInternet = 'noInternet',
  bluetoothPoweredOff = 'bluetoothPoweredOff',
  bluetoothUnauthorized = 'bluetoothUnauthorized',
  qr = 'qr',
  cardDetailsQr = 'cardDetailsQr',
  error = 'error',
  claimOnMainnet = 'claimOnMainnet',
  customProviderEmail = 'customProviderEmail',
  ledgerNoApp = 'ledgerNoApp',
  ledgerAttention = 'ledgerAttention',
  ledgerLocked = 'ledgerLocked',
  errorAccountAdded = 'errorAccountAdded',
  errorCreateAccount = 'errorCreateAccount',
  walletsBottomSheet = 'walletsBottomSheet',
  transactionError = 'transactionError',
  locationUnauthorized = 'locationUnauthorized',
  providersBottomSheet = 'providersBottomSheet',
  copyAddressBottomSheet = 'copyAddressBottomSheet',
  captcha = 'captcha',
  domainBlocked = 'domainBlocked',
  raffleAgreement = 'raffleAgreement',
  lockedTokensInfo = 'lockedTokensInfo',
  notEnoughGas = 'notEnoughGas',
  cloudVerification = 'cloudVerification',
  viewErrorDetails = 'viewErrorDetails',
  cloudShareNotFound = 'cloudShareNotFound',
  keystoneScanner = 'keystoneScanner',
  keystoneQR = 'keystoneQR',
  sssLimitReached = 'sssLimitReached',
  pinError = 'pinError',
  removeSSS = 'removeSSS',
  popupNotification = 'popupNotification',
  info = 'info',
}

export interface BaseNewsItem {
  id: string;
  title: string;
  preview?: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  viewed: boolean;
  status: string;
}

export interface NewsItem extends BaseNewsItem {
  content: string;
  publishedAt: Date;
}

export interface RssNewsItem extends BaseNewsItem {
  url: string;
}

// https://github.com/adjust/react_native_sdk#get-current-authorisation-status
export enum AdjustTrackingAuthorizationStatus {
  userNotAsked = 0,
  userDeviceRestricted = 1,
  userDeniedAccess = 2,
  userAuthorizedAccess = 3,
  statusNotAvailable = -1,
}

export type BalanceConstructor =
  | BigNumber
  | BigNumberish
  | HexNumber
  | IBalance
  | Decimal
  | number
  | string;

export interface IBalance {
  readonly raw: Decimal;
  toNumber: () => number;
  toFloat: () => number;
  toFloatString: () => string;
  toString: () => string;
  toHex: () => string;
  isPositive: () => boolean;
  toBalanceString: () => string;
  operate: (
    value: BalanceConstructor,
    operation: 'add' | 'mul' | 'div' | 'sub',
  ) => IBalance;
  compare: (
    value: BalanceConstructor,
    operation: 'eq' | 'lt' | 'lte' | 'gt' | 'gte',
  ) => boolean;
}

export abstract class ISerializable {
  static fromJsonString: (obj: string | ISerializable) => ISerializable;

  abstract toJsonString(): string;

  /**
   * Custom console.log for an object
   */
  abstract toJSON(): string;
}

export interface IWidgetBase {
  component: string;
}

export interface ITransactionsWidget extends IWidgetBase {
  component: 'Transactions';
}

export interface ITransactionsShortWidget extends IWidgetBase {
  component: 'TransactionsShort';
}

export interface IRafflesWidget extends IWidgetBase {
  component: 'Raffles';
}

export interface IStakingWidget extends IWidgetBase {
  component: 'Staking';
}

export interface IGovernanceWidget extends IWidgetBase {
  component: 'Governance';
  link?: string;
}

export interface ILayoutWidget extends IWidgetBase {
  component: 'Layout';
  direction: 'horizontal' | 'vertical';
  child: IWidget[];
  id: string;
}

export interface IAdWidget extends IWidgetBase, Banner {
  component: 'Ad';
  target?: string;
  event?: MarketingEvents;
}

export interface IBannerWidget extends IWidgetBase, Banner {
  component: 'Banner';
  target?: string;
  event?: MarketingEvents;
}

export interface ITokensWidget extends IWidgetBase {
  component: 'TokenList';
}

export enum NftWidgetSize {
  small = 'small',
  medium = 'medium',
  large = 'large',
}

export interface INftWidget extends IWidgetBase {
  component: 'Nft';
  size: NftWidgetSize;
}

export interface ISwapWidget extends IWidgetBase {
  component: 'Swap';
}

export type IWidget = {id: string} & (
  | ITransactionsWidget
  | ITransactionsShortWidget
  | IRafflesWidget
  | IStakingWidget
  | IGovernanceWidget
  | ILayoutWidget
  | IAdWidget
  | IBannerWidget
  | ITokensWidget
  | INftWidget
  | ISwapWidget
);

export interface MarkupResponse {
  blocks: ILayoutWidget;
  created_at: string;
  id: string;
  screen: string;
  status: string;
  updated_at: string;
  version: number;
}

export type SendTransactionError = {
  reason: string;
  code: string;
  error: {
    code: number;
  };
  method: string;
  transaction: SendTransactionRequest;
  transactionHash: string;
};

export type ContractNameMap = Record<string, {name: string; symbol: string}>;

export type AddressCosmosHaqq = `haqq${string}`;
export type AddressEthereum = `0x${string}`;
export type AddressTron = `T${string}`;
export type AddressWallet = AddressCosmosHaqq | AddressEthereum | AddressTron;
export type HexNumber = `0x${string}`;

export type IndexerBalanceItem = [
  AddressCosmosHaqq | AddressEthereum,
  ChainId,
  HexNumber,
];
export type IndexerBalance = Array<IndexerBalanceItem>;
export type IndexerToken = {
  address: AddressCosmosHaqq;
  contract: AddressEthereum;
  created_at: string;
  updated_at: string;
  value: string;
  chain_id: number;
};
export type IndexerTime = Record<AddressCosmosHaqq | AddressEthereum, number>;

export type IndexerBalanceData = Record<
  ChainId,
  Record<AddressEthereum, BalanceModel>
>;

export type JsonRpcTransactionRequest = {
  to?: string;
  from?: string;
  nonce?: string;
  gasLimit?: string;
  gasPrice?: string;
  data?: string;
  value?: string;
  chainId?: number;
  type?: number;
  maxPriorityFeePerGas?: string;
  maxFeePerGas?: string;
  customData?: Record<string, any>;
  ccipReadEnabled?: boolean;
  accessList?: AccessListish;
};

export enum AddressType {
  wallet = 'wallet',
  contract = 'contract',
  unknown = 'unknown',
}

export type VerifyAddressResponse = {
  address: Record<ChainId, IContract>;
};

export interface MobXStoreFromRealm {
  realmSchemaName: string;
  isHydrated: boolean;
  migrate: () => void;
}

export interface MobXStoreItem {
  id: string;
}

type MobXStoreData =
  | MobXStoreItem
  | MobXStoreItem[]
  | Record<any, MobXStoreItem>
  | Record<any, Record<any, MobXStoreItem>>;

export interface MobXStore<TData extends MobXStoreData> {
  data: Record<string, TData>;

  getById(id: string): TData | undefined;

  getAll(): TData[];

  create(id: string, item: TData): string;

  update(id: string | undefined, item: Omit<Partial<TData>, 'id'>): boolean;

  remove(id: string): boolean;

  removeAll(): void;
}

export enum ExplorerStatusEnum {
  success = '1',
  error = '0',
}

export interface ExplorerBaseTransaction {
  blockNumber: number;
  confirmations: number;
  from: string;
  gasPrice: string;
  gasUsed: number;
  hash: string;
  input: string;
  timeStamp: string;
  to: string;
  value: string;
}

export interface ExplorerTransaction extends ExplorerBaseTransaction {
  blockHash: string;
  contractAddress: string;
  cumulativeGasUsed: number;
  gas: number;
  isError: ExplorerStatusEnum;
  nonce: string;
  transactionIndex: string;
  txreceipt_status: ExplorerStatusEnum;
}

export interface ExplorerLogDetail {
  address: string;
  data: string;
  topics: string[];
}

export interface ExplorerTransactionInfo extends ExplorerBaseTransaction {
  gasLimit: string;
  logs: ExplorerLogDetail[];
  revertReason: string;
  success: boolean;
}

export interface ExplorerReceiptStatusInfo {
  status: '0' | '1';
}

export interface ExplorerTransactionStatus {
  errDescription: string;
  isError: '0' | '1';
}

export interface ExplorerApiResponse<T> {
  message: string;
  result: T | null;
  status: ExplorerStatusEnum;
}

export type EIPAmountField = {
  amount: string;
  denom: string;
};

export type EIPMessage = {
  memo?: string;
  chain_id: string;
  account_number: string;
  sequence: string;
  fee?: {
    amount: EIPAmountField[];
    gas: string;
    feePayer?: string;
  };
  msgs: any[];
};

export type EIPDomain = {
  name: string;
  version: string;
  chainId: number;
  verifyingContract: string | 'cosmos';
  salt: string;
};

export type EIPTypesMap = Record<TypedDataTypesNames, TypedDataField[]>;

export type EIPTypedData = {
  primaryType: string;
  domain: EIPDomain;
  types: EIPTypesMap | object;
  message: EIPMessage | object;
};

export type ExtractPromiseType<T> = T extends Promise<infer U> ? U : T;

export type IToken = {
  /**
   * Token contract address
   */
  id: AddressEthereum;
  contract_created_at: IContract['created_at'];
  contract_updated_at: IContract['updated_at'];
  value: Balance;

  decimals: IContract['decimals'];
  is_erc20: IContract['is_erc20'];
  is_erc721: IContract['is_erc721'];
  is_erc1155: IContract['is_erc1155'];
  /**
   * Should be visible or not
   */
  is_in_white_list: IContract['is_in_white_list'];
  name: IContract['name'];
  symbol: IContract['symbol'];
  created_at: string;
  updated_at: string;
  chain_id: ChainId;

  image: ImageSourcePropType;
};

export type IContract = {
  address_type: AddressType;
  created_at: string;
  decimals: number | null;
  id: AddressCosmosHaqq;
  is_erc20: boolean | null;
  is_erc721: boolean | null;
  is_erc1155: boolean | null;
  is_in_white_list: boolean | null;
  is_transfer_prohibinden?: boolean | null;
  name: string | null;
  symbol: string | null;
  updated_at: string;
  icon: string | null;
  eth_address: string | null;
  min_input_amount: string | null;
  is_skip_eth_tx: boolean | null;
};

export type IndexerTokensData = Record<AddressEthereum, IToken[]>;

export enum BrowserPermissionStatus {
  allow = 'allow',
  allowOnce = 'allowOnce',
  deny = 'deny',
}

export enum BrowserPermissionType {
  geolocation = 'geolocation',
  // TODO:
  // camera = 'camera',
  // microphone = 'microphone',
}

export type BrowserPermissionItem = MobXStoreItem & {
  status: BrowserPermissionStatus;
  type: BrowserPermissionType;
  createdAt: number;
  lastUsedAt: number;
};

/**
 * @description mark all fields as optional and make selected field as requered
 */
export type PartialRequired<T, K extends keyof T> = Partial<T> & Pick<T, K>;

export enum DeeplinkProtocol {
  haqq = 'haqq',
  ethereum = 'ethereum',
  wc = 'wc',
}

export enum DeeplinkUrlKey {
  wc = 'wc',
  browser = 'browser',
  web3browser = 'web3browser',
  back9test = 'back9test',
  enableDeveloperMode = 'enableDeveloperMode',
  enableNetworkLogger = 'enableNetworkLogger',
  export = 'export',
  noBackend = 'noBackend',
  useRpc = 'useRpc',
}

export type Eventable = Required<{
  successEventName: string;
  errorEventName: string;
}>;

export type FiatRate = {denom: string; amount: string};
export type RatesResponse = Record<ChainId, Record<string, FiatRate[]>>;

export type IndexerTxMsgUnknown = {
  schema: string;
  type: IndexerTxMsgType.unknown;
};

export type IndexerTxMsgVote = {
  proposal_id: number;
  voter: string;
  opinion: number;
  type: IndexerTxMsgType.msgVote;
};

export type IndexerTxMsgWithdrawDelegatorReward = {
  delegator_address: AddressCosmosHaqq;
  validator_address: AddressCosmosHaqq;
  type: IndexerTxMsgType.msgWithdrawDelegatorReward;
};

export type IndexerTxMsgWithdrawValidatorCommission = {
  validator_address: AddressCosmosHaqq;
  type: IndexerTxMsgType.msgWithdrawValidatorCommission;
};

export type IndexerTxMsgSend = {
  from_address: AddressCosmosHaqq;
  to_address: AddressCosmosHaqq;
  amount: IndexerCoin[];
  type: IndexerTxMsgType.msgSend;
  contract_address: string;
};

export type IndexerTxMsgDelegateTx = {
  delegator_address: AddressCosmosHaqq;
  validator_address: AddressCosmosHaqq;
  amount: IndexerCoin;
  type: IndexerTxMsgType.msgDelegate;
};

export type IndexerTxMsgUndelegateTx = {
  delegator_address: AddressCosmosHaqq;
  validator_address: AddressCosmosHaqq;
  amount: IndexerCoin;
  type: IndexerTxMsgType.msgUndelegate;
};

export type IndexerTxMsgEthereumTx = {
  from_address: AddressCosmosHaqq;
  to_address: AddressCosmosHaqq;
  amount: IndexerCoin;
  type: IndexerTxMsgType.msgEthereumTx;
};

export type IndexerTxMsgEthereumErc20TransferTx = {
  contract_address: AddressCosmosHaqq;
  from_address: AddressCosmosHaqq;
  to_address: AddressCosmosHaqq;
  amount: IndexerCoin;
  type: IndexerTxMsgType.msgEthereumErc20TransferTx;
};

export type IndexerTxMsgEthereumNftTransferTx = {
  contract_address: AddressCosmosHaqq;
  from_address: AddressCosmosHaqq;
  to_address: AddressCosmosHaqq;
  token_id: string;
  type: IndexerTxMsgType.msgEthereumNftTransferTx;
};

export type IndexerTxMsgEthereumNftMintTx = {
  contract_address: AddressCosmosHaqq;
  to_address: AddressCosmosHaqq;
  token_id: string;
  type: IndexerTxMsgType.msgEthereumNftMintTx;
};

export type IndexerTxMsgEthereumRaffleTx = {
  contract_address: AddressCosmosHaqq;
  winner: AddressCosmosHaqq;
  amount: IndexerCoin;
  ticket: number;
  type: IndexerTxMsgType.msgEthereumRaffleTx;
};

export type IndexerTxMsgConvertIntoVestingAccountTx = {
  from_address: AddressCosmosHaqq;
  to_address: AddressCosmosHaqq;
  start_time?: number;
  merge: boolean;
  stake: boolean;
  validator_address: AddressCosmosHaqq;
  lockup_periods: IndexerPeriod[];
  vesting_periods: IndexerPeriod[];
  type: IndexerTxMsgType.msgConvertIntoVestingAccount;
};

export type IndexerTxMsgBeginRedelegateTx = {
  delegator_address: AddressCosmosHaqq;
  validator_src_address: AddressCosmosHaqq;
  validator_dst_address: AddressCosmosHaqq;
  amount: IndexerCoin;
  type: IndexerTxMsgType.msgBeginRedelegate;
};

export type IndexerTxMsgUnjailTx = {
  validator_address: AddressCosmosHaqq;
  type: IndexerTxMsgType.msgUnjail;
};

export type IndexerTxMsgCreateValidatorTx = {
  description?: IndexerTxMsgCreateValidatorTxDescription;
  commission?: IndexerTxMsgCreateValidatorTxCommissionRates;
  min_self_delegation: string;
  delegator_address: AddressCosmosHaqq;
  validator_address: AddressCosmosHaqq;
  value?: IndexerCoin;
  type: IndexerTxMsgType.msgCreateValidator;
};

export type IndexerTxMsgEditValidatorTx = {
  description?: IndexerTxMsgCreateValidatorTxDescription;
  commission_rate: string;
  min_self_delegation: string;
  validator_address: AddressCosmosHaqq;
  type: IndexerTxMsgType.msgEditValidator;
};

export type IndexerTxMsgCreateValidatorTxDescription = {
  moniker: string;
  identity: string;
  website: string;
  security_contact: string;
  details: string;
};

export type IndexerTxMsgCreateValidatorTxCommissionRates = {
  rate: string;
  max_rate: string;
  max_change_rate: string;
};

export type IndexerPeriod = {
  amount: IndexerCoin[];
  length: number;
};

export type IndexerCoin = {
  denom: string;
  amount: string;
  contract_address?: AddressCosmosHaqq;
};

export type IndexerTxMsgApproval = {
  type: IndexerTxMsgType.msgEthereumApprovalTx;
  amount: string;
  contract_address: AddressCosmosHaqq;
  owner: AddressCosmosHaqq;
  spender: AddressCosmosHaqq;
};

export type IndexerTxMsgEventTx = {
  type: IndexerTxMsgType.msgEventTx;
  blockId: string;
  contractAddress: string;
  data: string;
  message: {
    transfer?: {
      from: string;
      to: string;
      value: string;
    };
  };
  messageType: 'transfer' | string;
  topic0: string;
  topic1: string;
  topic2: string;
  txId: string;
};

export type IbcRecvPacket = {
  amount: string;
  contract_address: string;
  denom: string;
  receiver: string;
  sender: string;
};

/**
 * Represents a message received packet in the IBC core channel.
 *
 * @property {IndexerTxMsgType.msgIbcCoreChannelV1MsgRecvPacket} type - The type of the message.
 * @property {string} packet - A base64 encoded JSON string containing the packet details.
 * The decoded JSON string has the following structure:
 * ```json
 * {
 *   "amount": "2663",
 *   "contract_address": "haqq1lg7z9srfh92k5je00m8paca5v7gf7jry8hj08z",
 *   "denom": "ibc/A4DB47A9D3CF9A068D454513891B526702455D3EF08FB9EB558C561F9DC2B701",
 *   "receiver": "haqq10msrwkss4nrapc7d78ppe9qfheafmlmmrtgqvq",
 *   "sender": "cosmos1c7hlqfl5a3tz38dwrhc03gzcyv7wnj8003wema"
 * }
 * ```
 * @property {string} signer - The signer of the message.
 */
export type IndexerTxMsgIbcCoreChannelV1MsgRecvPacket = {
  type: IndexerTxMsgType.msgIbcCoreChannelV1MsgRecvPacket;
  packet: string; // base64 encoded json string
  signer: string;
};

export type IndexerTxMsgIbcApplicationsTransferV1MsgTransfer = {
  type: IndexerTxMsgType.msgIbcApplicationsTransferV1MsgTransfer;
  amount: {
    amount: string;
    denom: string; // ibc/00000000000000000
  };
  receiver: string;
  sender: string;
  contract_address: string;
};

export type IndexerTxMsgProtoTx = {
  type: IndexerTxMsgType.msgProtoTx;
  transferContract?: {
    amount: string;
    ownerAddress: AddressTron;
    toAddress: AddressTron;
  };
  triggerSmartContract?: {
    contractAddress: AddressTron;
    data: string;
    ownerAddress: AddressTron;
  };
};

export enum IndexerProtoMsgTxType {
  transferContract = 'TransferContract',
  triggerSmartContract = 'TriggerSmartContract',
}

export enum IndexerTxMsgType {
  unknown = 'unknown',
  msgVote = 'msgVote',
  msgWithdrawDelegatorReward = 'msgWithdrawDelegatorReward',
  msgWithdrawDelegationReward = 'msgWithdrawDelegationReward',
  msgWithdrawValidatorCommission = 'msgWithdrawValidatorCommission',
  msgSend = 'msgSend',
  msgDelegate = 'msgDelegate',
  msgUndelegate = 'msgUndelegate',
  msgEthereumTx = 'msgEthereumTx',
  msgEthereumErc20TransferTx = 'msgEthereumErc20TransferTx',
  msgEthereumNftTransferTx = 'msgEthereumNftTransferTx',
  msgEthereumNftMintTx = 'msgEthereumNftMintTx',
  msgEthereumRaffleTx = 'msgEthereumRaffleTx',
  msgConvertIntoVestingAccount = 'msgConvertIntoVestingAccount',
  msgBeginRedelegate = 'msgBeginRedelegate',
  msgUnjail = 'msgUnjail',
  msgCreateValidator = 'msgCreateValidator',
  msgEditValidator = 'msgEditValidator',
  msgEthereumApprovalTx = 'msgEthereumApprovalTx',
  msgProtoTx = 'msgProtoTx',
  msgEventTx = 'msgEventTx',
  msgIbcCoreChannelV1MsgRecvPacket = 'msgIbcCoreChannelV1MsgRecvPacket', // IBC incoming transaction (receive)
  msgIbcApplicationsTransferV1MsgTransfer = 'msgIbcApplicationsTransferV1MsgTransfer', // IBC outgoing transaction (send)
}

export type IndexerTxMsgUnion =
  | {msg: IndexerTxMsgUnknown}
  | {msg: IndexerTxMsgVote}
  | {msg: IndexerTxMsgWithdrawDelegatorReward}
  | {msg: IndexerTxMsgWithdrawValidatorCommission}
  | {msg: IndexerTxMsgSend}
  | {msg: IndexerTxMsgDelegateTx}
  | {msg: IndexerTxMsgUndelegateTx}
  | {msg: IndexerTxMsgEthereumTx}
  | {msg: IndexerTxMsgEthereumErc20TransferTx}
  | {msg: IndexerTxMsgEthereumNftTransferTx}
  | {msg: IndexerTxMsgEthereumNftMintTx}
  | {msg: IndexerTxMsgEthereumRaffleTx}
  | {msg: IndexerTxMsgConvertIntoVestingAccountTx}
  | {msg: IndexerTxMsgBeginRedelegateTx}
  | {msg: IndexerTxMsgUnjailTx}
  | {msg: IndexerTxMsgCreateValidatorTx}
  | {msg: IndexerTxMsgEditValidatorTx}
  | {msg: IndexerTxMsgApproval}
  | {msg: IndexerTxMsgProtoTx}
  | {msg: IndexerTxMsgEventTx}
  | {msg: IndexerTxMsgIbcCoreChannelV1MsgRecvPacket}
  | {msg: IndexerTxMsgIbcApplicationsTransferV1MsgTransfer};

export enum IndexerTransactionStatus {
  inProgress = -1,
  success = 0,
  failed = 1,
}

export type IndexerTransaction = {
  block: number;
  chain_id: string;
  code: IndexerTransactionStatus;
  fee: number;
  gas_limit: number;
  hash: string;
  input: string;
  ts: string;
  id: string;
  confirmations: number;
  msg_type: string;
  forWallet?: string[];
  participants: {
    address: string;
    blockId: string;
    role: IndexerTransactionParticipantRole;
    txId: string;
  }[];
} & IndexerTxMsgUnion;

export enum IndexerTransactionParticipantRole {
  sender = 'sender',
  receiver = 'receiver',
}

export type IndexerTransactionWithType<T extends IndexerTxMsgType> = Extract<
  IndexerTransaction,
  {msg: {type: T}}
>;

export type IndexerTransactionResponse = {
  hash: string;
  txs?: IndexerTransaction[];
  transactions?: IndexerTransaction[];
};

export type ChainId = string | number;

export type IndexerTxParsedTokenInfo = {
  name: string;
  symbol: string;
  icon: ImageSourcePropType;
  decimals: number;
  contract_address?: string;
};
export type IStory = {
  id: string;
  title: string;
  preview: string;
  status: 'published';
  open_event: string | null;
  updated_at: string;
  created_at: string;
  attachments: {
    id: string;
    story_id: string;
    position: number;
    status: 'published';
    markup: {
      row: {
        event?: MarketingEvents;
        text: string;
        type: 'button' | 'text' | 'spacer';
        onPress?: () => void;
        target?: string;
      };
    }[];
    attachment: {
      duration: number;
      source: string;
      type: 'image' | 'video';
    };
    updated_at: string;
    created_at: string;
  }[];
  seen?: boolean;
};

export type StoriesResponse = IStory[];

export type ArrayElement<A> = A extends readonly (infer T)[] ? T : never;

export type Language = {
  id: AppLanguage;
  title: string;
  local_title: string;
  status: 'published';
  created_at: string;
  updated_at: string;
  hash: string;
};
export type LanguagesResponse = Language[];

export enum DataFetchSource {
  Backend = 'Backend',
  Rpc = 'Rpc',
}
