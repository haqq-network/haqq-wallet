import React from 'react';

import {BigNumber} from '@ethersproject/bignumber';
import {Validator} from '@evmos/provider';
import {Proposal} from '@evmos/provider/dist/rest/gov';
import {Coin} from '@evmos/transactions';
import {AccessListish, BigNumberish} from '@haqq/provider-base';
import {ProviderMnemonicReactNative} from '@haqq/provider-mnemonic-react-native';
import {ProviderSSSReactNative} from '@haqq/provider-sss-react-native';
import {NativeStackNavigationOptions} from '@react-navigation/native-stack';
import {SessionTypes} from '@walletconnect/types';
import Decimal from 'decimal.js';
import {
  ImageSourcePropType,
  ImageStyle,
  TextStyle,
  ViewStyle,
} from 'react-native';
import {Results} from 'realm';

import {Color} from '@app/colors';
import {CaptchaType} from '@app/components/captcha';
import {TotalValueTabNames} from '@app/components/total-value-info';
import {IconProps} from '@app/components/ui';
import {I18N} from '@app/i18n';
import {Banner} from '@app/models/banner';
import {Provider} from '@app/models/provider';
import {Transaction} from '@app/models/transaction';
import {Wallet} from '@app/models/wallet';
import {SignUpStackRoutes, WelcomeStackRoutes} from '@app/route-types';
import {EthNetwork} from '@app/services';
import {Balance} from '@app/services/balance';
import {SssProviders} from '@app/services/provider-sss';
import {WalletConnectApproveConnectionEvent} from '@app/types/wallet-connect';
import {EIP155_SIGNING_METHODS} from '@app/variables/EIP155';

import {AwaitValue} from './helpers/await-for-value';

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
}

export enum TransactionSource {
  unknown,
  date,
  send,
  receive,
  contract,
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

export type TransactionListContract = Transaction & {
  source: TransactionSource.contract;
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
  | TransactionListDate
  | TransactionListContract;

export type TransactionResponse = Awaited<
  ReturnType<EthNetwork['transferTransaction']>
>;

export type SendTransactionRequest = Awaited<
  ReturnType<(typeof EthNetwork)['sendTransaction']>
>;

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
      type: 'sss';
      sssPrivateKey: string | null;
      sssCloudShare: string | null;
      sssLocalShare: string | null;
      verifier: string;
      token: string;
    }
  | {type: 'empty'}
  | LedgerWalletInitialData;

export type LedgerWalletInitialData = {
  type: 'ledger';
  address: HaqqEthereumAddress;
  hdPath: string;
  publicKey: string;
  deviceId: string;
  deviceName: string;
};

export type RootStackParamList = {
  chooseAccount:
    | (WalletInitialData & {provider: ProviderMnemonicReactNative})
    | {
        provider: ProviderSSSReactNative;
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
    wallet: Wallet;
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
    wallets: Wallet[];
    title: string;
    initialAddress?: string;
  };
  valueSelector: {
    title: string;
    values: AwaitValue[];
    initialIndex?: number;
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
  ar = 'ar',
}

export enum AppTheme {
  light = 'light',
  dark = 'dark',
  system = 'system',
}

export type AddWalletParams = {
  address: HaqqEthereumAddress;
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
  balance: number;
};

export type ChooseAccountItem = AddWalletParams & {
  name: string;
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

export interface RemoteMessage<TData = Record<string, any>> {
  data: TData;
  from: string;
  messageId: string;
  notification: {body: string; title: string};
}

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
    wallets: Wallet[];
    closeDistance?: () => number;
    title: I18N;
    autoSelectWallet?: boolean;
    initialAddress?: string;
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
    closeDistance?: () => number;
    eventSuffix?: string;
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
    errorDetails: string;
    onClose?: () => void;
  };
  cloudShareNotFound: {onClose?: () => void; wallet: Wallet};
  sssLimitReached: {onClose?: () => void};
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
  captcha = 'captcha',
  domainBlocked = 'domainBlocked',
  raffleAgreement = 'raffleAgreement',
  lockedTokensInfo = 'lockedTokensInfo',
  notEnoughGas = 'notEnoughGas',
  cloudVerification = 'cloudVerification',
  viewErrorDetails = 'viewErrorDetails',
  cloudShareNotFound = 'cloudShareNotFound',
  sssLimitReached = 'sssLimitReached',
}

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
  isPositive: () => this is IBalance;
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
}

export interface IAdWidget extends IWidgetBase, Banner {
  component: 'Ad';
  target?: string;
  event?: AdjustEvents;
}

export interface IBannerWidget extends IWidgetBase, Banner {
  component: 'Banner';
  target?: string;
  event?: AdjustEvents;
}

export interface ITokensWidget extends IWidgetBase {
  component: 'Tokens';
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

export type IWidget =
  | ITransactionsWidget
  | ITransactionsShortWidget
  | IRafflesWidget
  | IStakingWidget
  | IGovernanceWidget
  | ILayoutWidget
  | IAdWidget
  | IBannerWidget
  | ITokensWidget
  | INftWidget;

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

export type OnTransactionRowPress = (
  hash: string,
  params?: Omit<RootStackParamList['transactionDetail'], 'hash'>,
) => void;

export type ContractNameMap = Record<string, string>;

export type HaqqCosmosAddress = `haqq${string}` & string;
export type HaqqEthereumAddress = `0x${string}` & string;
export type HexNumber = `0x${string}` & string;

export type IndexerBalance = Record<HaqqCosmosAddress, HexNumber>;
export type IndexerToken = {
  address: HaqqCosmosAddress;
  contract: HaqqCosmosAddress;
  created_at: string;
  updated_at: string;
  value: string;
};
export type IndexerTime = Record<HaqqCosmosAddress, number>;

export interface BalanceData {
  vested: Balance;
  staked: Balance;
  available: Balance;
  total: Balance;
  locked: Balance;
  availableForStake: Balance;
  // next time to unlock vested tokens
  unlock: Date;
}

export type IndexerBalanceData = Record<HaqqEthereumAddress, BalanceData>;

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

export interface VerifyAddressResponse {
  id: string;
  addressType: AddressType;
  name?: string | null;
  symbol?: string | null;
  decimals?: number | null;
  isErc20?: boolean | null;
  isErc721?: boolean | null;
  isErc1155?: boolean | null;
  isInWhiteList?: boolean | null;
  updatedAt: string;
  createdAt: string;
}

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

export interface EIPTypedData {
  types: object;
  primaryType: string;
  domain: {
    name: string;
    version: string;
    chainId: number;
    verifyingContract: string;
    salt: string;
  };
  message: object;
}

export type ExtractPromiseType<T> = T extends Promise<infer U> ? U : T;

export type IToken = {
  /**
   * Token contract address
   */
  id: HaqqCosmosAddress;
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

  image: ImageSourcePropType;
};

export type IContract = {
  address_type: 'contract';
  created_at: string;
  decimals: number | null;
  id: HaqqCosmosAddress;
  is_erc20: boolean | null;
  is_erc721: boolean | null;
  is_erc1155: boolean | null;
  is_in_white_list: boolean | null;
  name: string | null;
  symbol: string | null;
  updated_at: string;
  icon: string | null;
};

export type IndexerTokensData = Record<HaqqEthereumAddress, IToken[]>;

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
  etherium = 'etherium',
  wc = 'wc',
}

export enum DeeplinkUrlKey {
  wc = 'wc',
  browser = 'browser',
  web3browser = 'web3browser',
  back9test = 'back9test',
  provider = 'provider',
  enableDeveloperMode = 'enableDeveloperMode',
}

export type Eventable = Required<{
  successEventName: string;
  errorEventName: string;
}>;
