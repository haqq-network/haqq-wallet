import {Proposal as ProposalProvider} from '@evmos/provider';
import {Proposal as ProposalGovProvider} from '@evmos/provider/dist/rest/gov';
import {ProviderMnemonicBase, ProviderSSSBase} from '@haqq/rn-wallet-providers';
import {SessionTypes} from '@walletconnect/types';

import {TotalValueTabNames} from '@app/components/total-value-info';
import {AwaitValue} from '@app/helpers/await-for-value';
import {NftCollection, NftItem} from '@app/models/nft';
import {ProviderModel} from '@app/models/provider';
import {Wallet} from '@app/models/wallet';
import {Balance} from '@app/services/balance';
import {SssProviders} from '@app/services/provider-sss';
import {
  BiometryType,
  Eventable,
  IStory,
  IToken,
  JsonRpcMetadata,
  LedgerWalletInitialData,
  MarketingEvents,
  PartialJsonRpcRequest,
  PopupNotificationBannerId,
  Raffle,
  RootStackParamList,
  TransactionResponse,
  ValidatorItem,
  WalletInitialData,
  WalletType,
} from '@app/types';
import {WalletConnectApproveConnectionEvent} from '@app/types/wallet-connect';

import {Fee} from './models/fee';
import {SecureValue} from './modifiers/secure-value';
import {CalculatedFees} from './services/eth-network/types';
import {SushiPoolEstimateResponse} from './services/indexer';

export type AnyRouteFromParent =
  | SignInStackRoutes
  | SignUpStackRoutes
  | LedgerStackRoutes
  | KeystoneStackRoutes;

export enum WelcomeStackRoutes {
  Welcome = 'welcome',
  WelcomeNews = 'welcomeNews',
  SignUp = 'signup',
  Ledger = 'ledger',
  SignIn = 'signin',
  NewsDetail = 'newsDetail',
  InAppBrowser = 'inAppBrowser',
  Device = 'device',
}

export type WelcomeStackParamList = {
  [WelcomeStackRoutes.Welcome]: undefined;
  [WelcomeStackRoutes.WelcomeNews]: undefined;
  [WelcomeStackRoutes.SignUp]?: {
    screen: SignUpStackRoutes.SignupStoreWallet;
    params: SignUpStackParamList[SignUpStackRoutes.SignupStoreWallet];
  };
  [WelcomeStackRoutes.Ledger]: undefined;
  [WelcomeStackRoutes.SignIn]: undefined;
  [WelcomeStackRoutes.NewsDetail]: {
    id: string;
    openEvent: MarketingEvents;
    linkEvent: MarketingEvents;
    scrollEvent: MarketingEvents;
  };
  [WelcomeStackRoutes.Device]: undefined;
  [WelcomeStackRoutes.InAppBrowser]: HomeStackParamList[HomeStackRoutes.InAppBrowser];
};

export enum SignUpStackRoutes {
  SignUpAgreement = 'signupAgreement',
  SignUpNetworks = 'signupNetworks',
  SignUpNetworkExists = 'signupNetworkExists',
  SignUpPin = 'signupPin',
  OnboardingSetupPin = 'onboardingSetupPin',
  SignupStoreWallet = 'signupStoreWallet',
  SignupCloudProblems = 'cloudProblems',
  SignupImportantInfo = 'signupImportantInfo',
}

export type SignUpStackParamList = WelcomeStackParamList & {
  [SignUpStackRoutes.SignUpAgreement]: {
    nextScreen:
      | SignUpStackRoutes.OnboardingSetupPin
      | SignUpStackRoutes.SignUpNetworks;
  };
  [SignUpStackRoutes.SignUpNetworks]: WalletInitialData;
  [SignUpStackRoutes.SignUpNetworkExists]: {
    provider: SssProviders;
    email?: string;
  } & WalletInitialData;
  [SignUpStackRoutes.SignUpPin]: WalletInitialData;
  [SignUpStackRoutes.OnboardingSetupPin]: WalletInitialData;
  [SignUpStackRoutes.SignupStoreWallet]: WalletInitialData & {
    nextScreen?: SignUpStackRoutes;
  };
  [SignUpStackRoutes.SignupCloudProblems]: {
    sssProvider: SssProviders;
    onNext: () => void;
  };
  [SignUpStackRoutes.SignupImportantInfo]: {
    onNext: () => void;
  };
};

export enum HomeEarnStackRoutes {
  HomeEarn = 'homeEarn_',
  StakingValidators = 'stakingValidators',
  StakingInfo = 'stakingInfo',
  Staking = 'staking',
  StakingDelegate = 'stakingDelegate',
  StakingUnDelegate = 'stakingUnDelegate',
  RaffleDetails = 'raffleDetails',
  RaffleReward = 'raffleReward',
}

export type HomeEarnStackParamList = HomeStackParamList & {
  [HomeEarnStackRoutes.HomeEarn]: undefined;
  [HomeEarnStackRoutes.StakingValidators]: undefined;
  [HomeEarnStackRoutes.StakingInfo]: {validator: ValidatorItem};
  [HomeEarnStackRoutes.Staking]: undefined;
  [HomeEarnStackRoutes.StakingDelegate]: {
    validator: string;
    selectedWalletAddress: string;
  };
  [HomeEarnStackRoutes.StakingUnDelegate]: {
    validator: string;
    selectedWalletAddress: string;
  };
  [HomeEarnStackRoutes.RaffleDetails]: {
    item: Raffle;
    prevIslmCount: number;
    prevTicketsCount: number;
  };
  [HomeEarnStackRoutes.RaffleReward]: {
    item: Raffle;
  };
};

export enum AddressBookStackRoutes {
  SettingsAddressBook = 'settingsAddressBook_',
  SettingsContactEdit = 'settingsContactEdit',
}

export type AddressBookParamList = SettingsStackParamList & {
  [AddressBookStackRoutes.SettingsAddressBook]: undefined;
  [AddressBookStackRoutes.SettingsContactEdit]: {
    name: string;
    address: string;
    isCreate?: boolean;
  };
};

export enum SssMigrateStackRoutes {
  SssMigrateAgreement = 'sssMigrateAgreement',
  SssMigrateNetworks = 'sssMigrateNetworks',
  SssMigrateRewrite = 'sssMigrateRewrite',
  SssMigrateStore = 'sssMigrateStore',
  SssMigrateFinish = 'sssMigrateFinish',
  SssMigrateSignupImportantInfo = 'sssMigrateSignupImportantInfo',
}

export type SssMigrateStackParamList = HomeStackParamList & {
  [SssMigrateStackRoutes.SssMigrateAgreement]: {
    accountId: string;
    pinEnabled?: boolean;
  };
  [SssMigrateStackRoutes.SssMigrateNetworks]: {accountId: string};
  [SssMigrateStackRoutes.SssMigrateRewrite]: {
    accountId: string;
    privateKey: SecureValue<string>;
    provider: SssProviders;
    email?: string;
    verifier: string;
    token: string;
  };
  [SssMigrateStackRoutes.SssMigrateStore]: {
    accountId: string;
    privateKey: SecureValue<string | null>;
    provider?: SssProviders;
    email?: string;
    verifier: string;
    token: string;
  };
  [SssMigrateStackRoutes.SssMigrateFinish]: undefined;
  [SssMigrateStackRoutes.SssMigrateSignupImportantInfo]: {
    onNext: () => void;
  };
};

export enum BrowserStackRoutes {
  BrowserHomePage = 'browserHomePage',
  Web3browser = 'web3browser',
  BrowserSearchPage = 'browserSearchPage',
  BrowserEditBookmarks = 'browserEditBookmarksScreen',
  BrowserPrivacyPopupStackScreen = 'browserPrivacyPopupStack',
}

export type BrowserStackParamList = HomeStackParamList & {
  [BrowserStackRoutes.BrowserPrivacyPopupStackScreen]: {};
  [BrowserStackRoutes.BrowserHomePage]: undefined;
  [BrowserStackRoutes.Web3browser]: {url: string; popup?: boolean};
  [BrowserStackRoutes.BrowserSearchPage]?: {initialSearchText?: string};
  [BrowserStackRoutes.BrowserEditBookmarks]: undefined;
};

export enum NewsStackRoutes {
  News = 'homeNews_',
  NewsDetail = 'newsDetail',
  OurNews = 'ourNews',
}

export type NewsStackParamList = {
  [NewsStackRoutes.News]: undefined;
  [NewsStackRoutes.NewsDetail]: {
    id: string;
    openEvent: MarketingEvents;
    linkEvent: MarketingEvents;
    scrollEvent: MarketingEvents;
  };
  [NewsStackRoutes.OurNews]: undefined;
};

export enum SecurityStackRoutes {
  SettingsSecurity = 'settingsSecurity_',
  SettingsSecurityPin = 'settingsSecurityPin',
}

export type SecurityStackParamList = HomeStackParamList &
  SettingsStackParamList & {
    [SecurityStackRoutes.SettingsSecurity]: undefined;
    [SecurityStackRoutes.SettingsSecurityPin]: undefined;
  };

export enum HomeFeedStackRoutes {
  HomeFeed = 'homeFeed_',
  Governance = 'governance',
  HomeEarn = 'homeEarn',
  HomeStories = 'homeStories',
}

export type HomeFeedStackParamList = HomeStackParamList & {
  [HomeFeedStackRoutes.HomeFeed]: undefined;
  [HomeFeedStackRoutes.Governance]: undefined;
  [HomeFeedStackRoutes.HomeEarn]: undefined;
  [HomeFeedStackRoutes.HomeStories]: {id: IStory['id']};
};

export enum BackupStackRoutes {
  BackupWarning = 'backupWarning',
  BackupCreate = 'backupCreate',
  BackupVerify = 'backupVerify',
  BackupFinish = 'backupFinish',
}

export type BackupStackParamList = HomeStackParamList & {
  [BackupStackRoutes.BackupWarning]: {
    wallet: Wallet;
    pinEnabled?: boolean;
  };
  [BackupStackRoutes.BackupCreate]: {
    wallet: Wallet;
  };
  [BackupStackRoutes.BackupVerify]: {
    wallet: Wallet;
  };
  [BackupStackRoutes.BackupFinish]: undefined;
};

export enum SettingsStackRoutes {
  Home = 'homeSettings_',
  SettingsAccounts = 'settingsAccounts',
  SettingsAddressBook = 'settingsAddressBook',
  SettingsCurrency = 'settingsCurrency',
  SettingsTheme = 'settingsTheme',
  SettingsNotification = 'settingsNotification',
  SettingsProviders = 'settingsProviders',
  SettingsAbout = 'settingsAbout',
  SettingsTest = 'settingsTest',
  SettingsSecurity = 'settingsSecurity',
  SettingsProviderForm = 'settingsProviderForm',
  WalletConnectWalletList = 'walletConnectWalletList',
  BackupSssSuggestion = 'backupSssSuggestion',
  SettingsDeveloperTools = 'settingsDeveloperTools',
  SettingsLanguage = 'settingsLanguage',
}

export type SettingsStackParamList = HomeStackParamList & {
  [SettingsStackRoutes.Home]?: {
    screen: SettingsStackRoutes.SettingsProviderForm;
    params: {
      id?: number;
      data?: Partial<ProviderModel>;
    };
  };
  [SettingsStackRoutes.SettingsAccounts]: undefined;
  [SettingsStackRoutes.SettingsAddressBook]: undefined;
  [SettingsStackRoutes.SettingsLanguage]: undefined;
  [SettingsStackRoutes.SettingsCurrency]: undefined;
  [SettingsStackRoutes.SettingsTheme]: undefined;
  [SettingsStackRoutes.SettingsNotification]: undefined;
  [SettingsStackRoutes.SettingsProviders]: undefined;
  [SettingsStackRoutes.SettingsAbout]: undefined;
  [SettingsStackRoutes.SettingsTest]: undefined;
  [SettingsStackRoutes.SettingsSecurity]: undefined;
  [SettingsStackRoutes.SettingsProviderForm]: undefined;
  [SettingsStackRoutes.WalletConnectWalletList]: undefined;
  [SettingsStackRoutes.BackupSssSuggestion]: {accountId: string};
  [SettingsStackRoutes.SettingsDeveloperTools]: undefined;
};

export enum ProvidersStackRoutes {
  SettingsProviders = 'settingsProviders_',
  SettingsProviderForm = 'settingsProviderForm',
}

export type ProvidersStackParamList = {
  [ProvidersStackRoutes.SettingsProviders]: undefined;
  [ProvidersStackRoutes.SettingsProviderForm]: {
    id?: number;
    data?: Partial<ProviderModel>;
  };
};

export enum GovernanceStackRoutes {
  GovernanceList = 'governaneList',
  Proposal = 'proposal',
  ProposalDeposit = 'proposalDeposit',
}

export type GovernanceStackParamList = HomeFeedStackParamList & {
  [GovernanceStackRoutes.GovernanceList]: undefined;
  [GovernanceStackRoutes.Proposal]: {proposal: ProposalGovProvider};
  [GovernanceStackRoutes.ProposalDeposit]: {
    proposal: ProposalGovProvider;
    account: string;
  };
};

export enum HomeStackRoutes {
  Home = 'home',
  Create = '_create',
  Ledger = '_ledger',
  SignIn = '_signin',
  AccountInfo = 'accountInfo',
  Transaction = 'transaction',
  Nft = 'Nft',
  AccountDetail = 'accountDetail',
  Backup = 'backup',
  WalletProtectionPopup = 'walletProtectionPopup',
  WalletConnectApplicationDetailsPopup = 'walletConnectApplicationDetailsPopup',
  WalletConnectApplicationListPopup = 'walletConnectApplicationListPopup',
  TransactionDetail = 'transactionDetail',
  InAppBrowser = 'inAppBrowser',
  WalletConnect = 'walletConnect',
  SssMigrate = 'sssMigrate',
  BackupNotification = 'backupNotification',
  JsonRpcSign = 'jsonRpcSign',
  BackupSssNotification = 'backupSssNotification',
  PopupNotificationNews = 'popupNotificationNews',
  PopupNotification = 'popupNotification',
  PopupTrackActivity = 'popupTrackActivity',
  Web3BrowserPopup = 'web3BrowserPopup',
  WalletSelector = 'walletSelector',
  TotalValueInfo = 'totalValueInfo',
  ValueSelector = 'valueSelector',
  BrowserPrivacyPopupStack = 'browserPrivacyPopupStack',
  Device = '_device',
  Swap = '_swap',
  NewsDetailPushNotification = 'newsDetailsPushNotification',
  FeeSettings = 'feeSettings',
}

export type HomeStackParamList = {
  [HomeStackRoutes.Home]: undefined;
  [HomeStackRoutes.Create]: undefined;
  [HomeStackRoutes.Ledger]: undefined;
  [HomeStackRoutes.Device]: undefined;
  [HomeStackRoutes.SignIn]: undefined;
  [HomeStackRoutes.AccountInfo]: {accountId: string};
  [HomeStackRoutes.Transaction]: {
    from?: string;
    to?: string;
    nft?: NftItem;
  };
  [HomeStackRoutes.Nft]:
    | {
        initScreen: NftStackRoutes.NftItemDetails;
        item: NftItem;
      }
    | {
        initScreen: NftStackRoutes.NftCollectionDetails;
        item: NftCollection;
      };
  [HomeStackRoutes.AccountDetail]: {address: string};
  [HomeStackRoutes.Backup]: {
    wallet: Wallet;
    pinEnabled?: boolean;
  };
  [HomeStackRoutes.WalletProtectionPopup]: {
    wallet: Wallet;
    pinEnabled?: boolean;
  };
  [HomeStackRoutes.WalletConnectApplicationDetailsPopup]: {
    session: SessionTypes.Struct;
    isPopup?: boolean;
  };
  [HomeStackRoutes.WalletConnectApplicationListPopup]: {
    address: string;
    isPopup?: boolean;
  };
  [HomeStackRoutes.TransactionDetail]: {txId: string; addresses: string[]};
  [HomeStackRoutes.InAppBrowser]: {
    url: string;
    title?: string;
  };
  [HomeStackRoutes.WalletConnect]: {
    screen: 'walletConnectApproval';
    params: {
      event: WalletConnectApproveConnectionEvent;
    };
  };
  [HomeStackRoutes.SssMigrate]: {
    accountId: string;
    pinEnabled?: boolean;
  };
  [HomeStackRoutes.BackupNotification]: {wallet: Wallet};
  [HomeStackRoutes.JsonRpcSign]: {
    request: PartialJsonRpcRequest;
    metadata: JsonRpcMetadata;
    chainId?: number;
    selectedAccount?: string;
    hideContractAttention?: boolean;
  };
  [HomeStackRoutes.BackupSssNotification]: {accountId: string};
  [HomeStackRoutes.PopupNotificationNews]: {
    bannerId: PopupNotificationBannerId;
  };
  [HomeStackRoutes.PopupNotification]: {
    bannerId: PopupNotificationBannerId;
  };
  [HomeStackRoutes.PopupTrackActivity]: {bannerId: string};
  [HomeStackRoutes.Web3BrowserPopup]: {url: string; popup?: boolean};
  [HomeStackRoutes.WalletSelector]: Eventable & {
    wallets: Wallet[];
    title: string;
    initialAddress?: string;
  };
  [HomeStackRoutes.TotalValueInfo]?: {
    tab?: TotalValueTabNames;
  };
  [HomeStackRoutes.ValueSelector]: {
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
  [HomeStackRoutes.BrowserPrivacyPopupStack]: {
    screen: 'browserPrivacyDetails' | 'browserPrivacy';
    params?: RootStackParamList[RootStackParamList['browserPrivacyPopupStack']['screen']];
  };
  [HomeStackRoutes.Swap]: {
    address: string;
  };
  [HomeStackRoutes.NewsDetailPushNotification]: {
    id: string;
    openEvent: MarketingEvents;
    linkEvent: MarketingEvents;
    scrollEvent: MarketingEvents;
  };
  [HomeStackRoutes.FeeSettings]: Eventable & {
    fee: Fee;
    from: string;
    to: string;
    value?: Balance;
    data?: string;
    chainId?: string;
  };
};

export enum NftStackRoutes {
  NftItemDetails = 'nftItemDetails',
  NftCollectionDetails = 'nftCollectionDetails',
}

export type NftStackParamList = HomeFeedStackParamList & {
  [NftStackRoutes.NftItemDetails]: {item: NftItem};
  [NftStackRoutes.NftCollectionDetails]: {item: NftCollection};
};

export enum ProposalDepositStackRoutes {
  ProposalDepositForm = 'proposalDepositForm',
  ProposalDepositPreview = 'proposalDepositPreview',
  ProposalDepositFinish = 'proposalDepositFinish',
}

export type ProposalDepositStackParamList = GovernanceStackParamList & {
  [ProposalDepositStackRoutes.ProposalDepositForm]: {
    account: string;
    proposal: ProposalProvider;
  };
  [ProposalDepositStackRoutes.ProposalDepositPreview]: {
    fee: Balance;
    account: string;
    amount: number;
    proposal: ProposalProvider;
  };
  [ProposalDepositStackRoutes.ProposalDepositFinish]: {
    proposal: ProposalProvider;
    fee: Balance;
    txhash: string;
    amount: number;
  };
};

export enum TransactionStackRoutes {
  TransactionAddress = 'transactionAddress',
  TransactionSum = 'transactionSum',
  TransactionConfirmation = 'transactionConfirmation',
  TransactionNftConfirmation = 'transactionNftConfirmation',
  TransactionFinish = 'transactionFinish',
  TransactionNftFinish = 'transactionNftFinish',
  TransactionAccount = 'transactionAccount',
  TransactionLedger = 'transactionLedger',
  TransactionSumAddress = 'transactionSumAddress',
  TransactionContactEdit = 'transactionContactEdit',
  TransactionSelectCrypto = 'transactionSelectCrypto',
}

export type TransactionStackParamList = HomeFeedStackParamList & {
  [TransactionStackRoutes.TransactionAddress]: {
    from: string;
    to?: string | undefined;
    nft?: NftItem | undefined;
    token?: IToken | undefined;
  };
  [TransactionStackRoutes.TransactionSum]: {
    from: string;
    to: string;
    token: IToken;
  };
  [TransactionStackRoutes.TransactionConfirmation]: {
    from: string;
    to: string;
    amount: Balance;
    estimatedFee?: CalculatedFees;
    calculatedFees?: CalculatedFees;
    token: IToken;
  };
  [TransactionStackRoutes.TransactionFinish]: {
    fee: Fee;
    transaction: TransactionResponse;
    to?: string;
    hash: string;
    hideContact?: boolean;
    token: IToken;
    amount?: Balance;
  };
  [TransactionStackRoutes.TransactionNftConfirmation]: {
    from: string;
    to: string;
    nft: NftItem;
  };
  [TransactionStackRoutes.TransactionNftFinish]: {
    fee: Fee;
    nft: NftItem;
    transaction: TransactionResponse;
    to: string;
  };
  [TransactionStackRoutes.TransactionAccount]: {
    from: string;
    to: string;
  };
  [TransactionStackRoutes.TransactionLedger]: {
    from: string;
    to: string;
    amount: number;
    fee?: Balance;
  };
  [TransactionStackRoutes.TransactionSumAddress]: {
    to: string;
    from: string;
    event: string;
  };
  [TransactionStackRoutes.TransactionContactEdit]: {
    name: string;
    address: string;
  };
  [TransactionStackRoutes.TransactionSelectCrypto]: {
    from: string;
    to: string;
  };
};

export enum WalletConnectStackRoutes {
  WalletConnectWalletList = 'walletConnectWalletList_',
  WalletConnectApplicationDetails = 'walletConnectApplicationDetails',
  WalletConnectApplicationList = 'walletConnectApplicationList',
}

export type WalletConnectStackParamList = HomeStackParamList & {
  [WalletConnectStackRoutes.WalletConnectWalletList]: undefined;
  [WalletConnectStackRoutes.WalletConnectApplicationDetails]: {
    session: SessionTypes.Struct;
    isPopup?: boolean;
  };
  [WalletConnectStackRoutes.WalletConnectApplicationList]: {
    address: string;
    isPopup?: boolean;
  };
};

export enum JsonRpcSignPopupStackRoutes {
  JsonRpcSign = 'jsonRpcSignScreen',
  JsonRpcSignFeeSettings = 'jsonRpcSignFeeSettings',
}

export type JsonRpcSignPopupStackParamList = HomeStackParamList & {
  [JsonRpcSignPopupStackRoutes.JsonRpcSign]: {
    request: PartialJsonRpcRequest;
    metadata: JsonRpcMetadata;
    chainId?: number;
    selectedAccount?: string;
  };
  [JsonRpcSignPopupStackRoutes.JsonRpcSignFeeSettings]: {
    from: string;
    to: string;
    amount: Balance;
    data?: string;
  };
};

export enum ManageAccountsStackRoutes {
  SettingsAccounts = 'settingsAccounts_',
  SettingsAccountDetail = 'settingsAccountDetail',
  SettingsAccountEdit = 'settingsAccountEdit',
  SettingsAccountStyle = 'settingsAccountStyle',
  SettingsViewRecoveryPhrase = 'settingsViewRecoveryPhrase',
}

export type ManageAccountsStackParamList = HomeStackParamList &
  SettingsStackParamList & {
    [ManageAccountsStackRoutes.SettingsAccounts]: undefined;
    [ManageAccountsStackRoutes.SettingsAccountDetail]: {
      address: string;
      fromHomePage?: boolean;
    };
    [ManageAccountsStackRoutes.SettingsAccountEdit]: {
      address: string;
    };
    [ManageAccountsStackRoutes.SettingsAccountStyle]: {
      address: string;
    };
    [ManageAccountsStackRoutes.SettingsViewRecoveryPhrase]: {
      accountId: string;
      type: WalletType;
    };
  };

export enum OnboardingStackRoutes {
  OnboardingSetupPin = 'onboardingSetupPin_',
  OnboardingRepeatPin = 'onboardingRepeatPin',
  OnboardingBiometry = 'onboardingBiometry',
  OnboardingTrackUserActivity = 'onboardingTrackUserActivity',
  OnboardingFinish = 'onboardingFinish',
}

export type OnboardingStackParamList = WelcomeStackParamList & {
  [OnboardingStackRoutes.OnboardingSetupPin]: WalletInitialData & {
    provider?: ProviderMnemonicBase;
    currentPin: SecureValue<string>;
    nextScreen: AnyRouteFromParent;
    errorText?: string;
  };
  [OnboardingStackRoutes.OnboardingRepeatPin]: WalletInitialData & {
    provider?: ProviderMnemonicBase;
    currentPin: SecureValue<string>;
    nextScreen: AnyRouteFromParent;
  };
  [OnboardingStackRoutes.OnboardingBiometry]: {
    biometryType: BiometryType;
    nextScreen: AnyRouteFromParent;
  };
  [OnboardingStackRoutes.OnboardingTrackUserActivity]: {
    biometryType: BiometryType;
    nextScreen: AnyRouteFromParent;
  };
  [OnboardingStackRoutes.OnboardingFinish]: {
    nextScreen?: AnyRouteFromParent;
    action: 'create' | 'restore';
    hide?: boolean;
    event: MarketingEvents;
    onboarding?: boolean;
  };
};

export enum LedgerStackRoutes {
  LedgerAgreement = 'ledgerAgreement',
  LedgerBluetooth = 'ledgerBluetooth',
  LedgerScan = 'ledgerScan',
  LedgerAccounts = 'ledgerAccounts',
  LedgerVerify = 'ledgerVerify',
  OnboardingSetupPin = 'onboardingSetupPin',
  LedgerStoreWallet = 'ledgerStoreWallet',
  LedgerFinish = 'ledgerFinish',
}

export type LedgerStackParamList = WelcomeStackParamList & {
  [LedgerStackRoutes.LedgerAgreement]: WelcomeStackParamList[WelcomeStackRoutes.Ledger];
  [LedgerStackRoutes.LedgerBluetooth]: undefined;
  [LedgerStackRoutes.LedgerScan]: undefined;
  [LedgerStackRoutes.LedgerAccounts]: {deviceId: string; deviceName: string};
  [LedgerStackRoutes.LedgerVerify]: LedgerWalletInitialData & {
    nextScreen:
      | LedgerStackRoutes.LedgerStoreWallet
      | LedgerStackRoutes.OnboardingSetupPin;
  };
  [LedgerStackRoutes.OnboardingSetupPin]: LedgerWalletInitialData;
  [LedgerStackRoutes.LedgerStoreWallet]: LedgerWalletInitialData;
  [LedgerStackRoutes.LedgerFinish]: undefined;
};

export enum SignInStackRoutes {
  SigninNetworks = 'signinNetworks',
  SigninAgreement = 'signinAgreement',
  SigninRestoreWallet = 'signinRestoreWallet',
  SigninPin = 'signinPin',
  OnboardingSetupPin = 'onboardingSetupPin',
  SigninStoreWallet = 'signinStoreWallet',
  SigninNotExists = 'signinNotExists',
  SigninNotRecovery = 'signinNotRecovery',
  SigninCloudProblems = 'cloudProblems',
  SigninChooseAccount = 'chooseAccount',
  SigninSharesNotFound = 'signinSharesNotFound',
}

export type SignInStackParamList = WelcomeStackParamList & {
  [SignInStackRoutes.SigninNetworks]?: WelcomeStackParamList[WelcomeStackRoutes.SignIn];
  [SignInStackRoutes.SigninAgreement]?: WelcomeStackParamList[WelcomeStackRoutes.SignIn];
  [SignInStackRoutes.SigninRestoreWallet]: undefined;
  [SignInStackRoutes.SigninPin]: WalletInitialData;
  [SignInStackRoutes.SigninSharesNotFound]: undefined;
  [SignInStackRoutes.OnboardingSetupPin]: WalletInitialData & {
    provider?: ProviderMnemonicBase | ProviderSSSBase | SssProviders;
    biometryType?: BiometryType;
  };
  [SignInStackRoutes.SigninStoreWallet]: WalletInitialData & {
    nextScreen?: SignInStackRoutes;
  };
  [SignInStackRoutes.SigninNotExists]: WalletInitialData & {
    provider: ProviderMnemonicBase | ProviderSSSBase;
    email?: string;
  };
  [SignInStackRoutes.SigninNotRecovery]: WalletInitialData;
  [SignInStackRoutes.SigninCloudProblems]: {
    sssProvider: SssProviders;
    onNext: () => void;
  };
  [SignInStackRoutes.SigninChooseAccount]:
    | (WalletInitialData & {
        provider: ProviderMnemonicBase;
        nextScreen?: SignInStackRoutes;
      })
    | {
        provider: ProviderSSSBase;
        nextScreen?: SignInStackRoutes;
        sssProvider: string;
      };
};

export enum StakingDelegateStackRoutes {
  StakingDelegateForm = 'stakingDelegateForm',
  StakingDelegatePreview = 'stakingDelegatePreview',
  StakingDelegateFinish = 'stakingDelegateFinish',
}

export type StakingDelegateStackParamList = HomeStackParamList & {
  [StakingDelegateStackRoutes.StakingDelegateForm]: {
    account: string;
    validator: ValidatorItem;
  };
  [StakingDelegateStackRoutes.StakingDelegatePreview]: {
    account: string;
    amount: number;
    fee: Balance;
    validator: ValidatorItem;
  };
  [StakingDelegateStackRoutes.StakingDelegateFinish]: {
    txhash: string;
    validator: ValidatorItem;
    amount: number;
    fee: Balance;
  };
};

export enum StakingUnDelegateStackRoutes {
  StakingUnDelegateForm = 'stakingUnDelegateForm',
  StakingUnDelegatePreview = 'stakingUnDelegatePreview',
  StakingUnDelegateFinish = 'stakingUnDelegateFinish',
}

export type StakingUnDelegateStackParamList = HomeStackParamList & {
  [StakingUnDelegateStackRoutes.StakingUnDelegateForm]: {
    account: string;
    validator: ValidatorItem;
    maxAmount: number;
  };
  [StakingUnDelegateStackRoutes.StakingUnDelegatePreview]: {
    account: string;
    amount: number;
    fee: Balance;
    validator: ValidatorItem;
  };
  [StakingUnDelegateStackRoutes.StakingUnDelegateFinish]: {
    txhash: string;
    validator: ValidatorItem;
    amount: number;
    fee: Balance;
  };
};

export enum WalletConnectApprovalStackRoutes {
  WalletConnectApproval = 'walletConnectApproval',
}

export type WalletConnectApprovalStackParamList = {
  [WalletConnectApprovalStackRoutes.WalletConnectApproval]: {
    event: WalletConnectApproveConnectionEvent;
  };
};

export enum KeystoneStackRoutes {
  KeystoneAccounts = 'KeystoneAccounts',
  KeystoneConnectionSteps = 'KeystoneConnectionSteps',
  KeystoneFinish = 'KeystoneFinish',
  KeystoneCameraPermission = 'KeystoneCameraPermission',
  OnboardingSetupPin = 'OnboardingSetupPin',
}

export type KeystoneStackParamList = WelcomeStackParamList & {
  [KeystoneStackRoutes.KeystoneConnectionSteps]: WelcomeStackParamList[WelcomeStackRoutes.Device];
  [KeystoneStackRoutes.KeystoneCameraPermission]: undefined;
  [KeystoneStackRoutes.KeystoneAccounts]: {
    qrCBORHex: string;
  };
  [KeystoneStackRoutes.KeystoneFinish]: undefined;
  [KeystoneStackRoutes.OnboardingSetupPin]: undefined;
};

export enum DeviceStackRoutes {
  DeviceSelect = 'DeviceSelect',
  DeviceKeystone = 'DeviceKeystone',
  DeviceLedger = 'DeviceLedger',
}

export type DeviceStackParamList = {
  DeviceSelect: undefined;
  DeviceKeystone: undefined;
  DeviceLedger: undefined;
};

export type SwapStackParamList = {
  Swap: {
    address: string;
    slippage?: number;
    deadline?: number;
  };
  Preview: {
    address: string;
  };
  Finish: {
    token0: IToken;
    token1: IToken;
    txHash: string;
    estimateData: SushiPoolEstimateResponse;
    isWrapTx: boolean;
    isUnwrapTx: boolean;
    rate: string;
    amountIn: string;
    amountOut: string;
  };
};

export enum SwapStackRoutes {
  Swap = 'Swap',
  Preview = 'Preview',
  Finish = 'Finish',
}
