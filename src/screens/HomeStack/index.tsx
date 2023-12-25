import React, {memo} from 'react';

import {
  NativeStackNavigationOptions,
  createNativeStackNavigator,
} from '@react-navigation/native-stack';
import {SessionTypes} from '@walletconnect/types';
import {StatusBar} from 'react-native';

import {Color} from '@app/colors';
import {DismissPopupButton} from '@app/components/popup/dismiss-popup-button';
import {TotalValueTabNames} from '@app/components/total-value-info';
import {Spacer} from '@app/components/ui';
import {popupScreenOptionsWithMargin} from '@app/helpers';
import {AwaitValue} from '@app/helpers/await-for-value';
import {getWalletTitle} from '@app/helpers/get-wallet-title';
import {themeUpdaterHOC} from '@app/helpers/theme-updater-hoc';
import {I18N, getText} from '@app/i18n';
import {Wallet} from '@app/models/wallet';
import {basicScreenOptions} from '@app/screens';
import {AccountDetailScreen} from '@app/screens/HomeStack/account-detail';
import {BackupStack} from '@app/screens/HomeStack/BackupStack';
import {HomeScreen} from '@app/screens/HomeStack/home';
import {AccountInfoScreen} from '@app/screens/HomeStack/HomeFeedStack/account-info';
import {CreateStack} from '@app/screens/HomeStack/HomeFeedStack/create';
import {TransactionDetailScreen} from '@app/screens/HomeStack/HomeFeedStack/transaction-detail';
import {InAppBrowserScreen} from '@app/screens/HomeStack/in-app-browser';
import {JsonRpcSignPopupStack} from '@app/screens/HomeStack/JsonRpcSignPopupStack';
import {SssMigrateStack} from '@app/screens/HomeStack/SssMigrate';
import {TransactionStack} from '@app/screens/HomeStack/TransactionStack';
import {WalletProtectionPopupScreen} from '@app/screens/HomeStack/wallet-protection-popup';
import {WalletConnectApprovalStack} from '@app/screens/HomeStack/WalletConnectApprovalStack';
import {WalletConnectApplicationDetailsPopupScreen} from '@app/screens/HomeStack/WalletConnectStack/wallet-connect-application-details-popup';
import {WalletConnectApplicationListPopupScreen} from '@app/screens/HomeStack/WalletConnectStack/wallet-connect-application-list-popup';
import {BackupNotificationScreen} from '@app/screens/popup-backup-notification';
import {BackupSssNotificationScreen} from '@app/screens/popup-backup-sss-notification';
import {PopupNotificationScreen} from '@app/screens/popup-notification';
import {PopupNotificationNewsScreen} from '@app/screens/popup-notification-news';
import {PopupTrackActivityScreen} from '@app/screens/popup-track-activity';
import {TotalValueInfoScreen} from '@app/screens/total-value-info';
import {ValueSelectorScreen} from '@app/screens/value-selector-screen';
import {WalletSelectorScreen} from '@app/screens/wallet-selector-screen';
import {Web3BrowserPopup as Web3BrowserPopupScreen} from '@app/screens/web3-browser-popup';
import {LedgerStack} from '@app/screens/WelcomeStack/LedgerStack';
import {SignInStack} from '@app/screens/WelcomeStack/SignInStack';
import {
  Eventable,
  JsonRpcMetadata,
  NftItem,
  PartialJsonRpcRequest,
  PopupNotificationBannerId,
  RootStackParamList,
} from '@app/types';
import {WalletConnectApproveConnectionEvent} from '@app/types/wallet-connect';

export enum HomeStackRoutes {
  Home = 'home',
  Create = '_create',
  Ledger = '_ledger',
  SignIn = '_signin',
  AccountInfo = 'accountInfo',
  Transaction = 'transaction',
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
}

export type HomeStackParamList = {
  [HomeStackRoutes.Home]: undefined;
  [HomeStackRoutes.Create]: undefined;
  [HomeStackRoutes.Ledger]: undefined;
  [HomeStackRoutes.SignIn]: undefined;
  [HomeStackRoutes.AccountInfo]: {accountId: string};
  [HomeStackRoutes.Transaction]: {
    from?: string;
    to?: string;
    nft?: NftItem;
  };
  [HomeStackRoutes.AccountDetail]: {address: string};
  [HomeStackRoutes.Backup]: {wallet: Wallet};
  [HomeStackRoutes.WalletProtectionPopup]: {wallet: Wallet};
  [HomeStackRoutes.WalletConnectApplicationDetailsPopup]: {
    session: SessionTypes.Struct;
    isPopup?: boolean;
  };
  [HomeStackRoutes.WalletConnectApplicationListPopup]: {
    address: string;
    isPopup?: boolean;
  };
  [HomeStackRoutes.TransactionDetail]: {hash: string; contractName?: string};
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
  [HomeStackRoutes.SssMigrate]: {accountId: string};
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
  };
  [HomeStackRoutes.BrowserPrivacyPopupStack]: {
    screen: 'browserPrivacyDetails' | 'browserPrivacy';
    params?: RootStackParamList[RootStackParamList['browserPrivacyPopupStack']['screen']];
  };
};

const navigatorOptions = {
  gestureEnabled: false,
  freezeOnBlur: true,
};

const modalOptions: NativeStackNavigationOptions = {
  ...popupScreenOptionsWithMargin,
  presentation: 'modal',
  headerShown: false,
  gestureEnabled: true,
  gestureDirection: 'vertical',
};

const fullScreenModalOptions: NativeStackNavigationOptions = {
  headerShown: false,
  presentation: 'transparentModal',
  animation: 'fade',
  animationDuration: 0,
};

const inAppBrowserOptions: NativeStackNavigationOptions = {
  //@ts-ignore
  headerBackHidden: true,
  headerShown: true,
  gestureEnabled: false,
  header: () => <Spacer height={StatusBar.currentHeight} bg={Color.bg1} />,
};

const totalInfoOptions: NativeStackNavigationOptions = {
  ...modalOptions,
  headerShown: true,
  headerLeft: () => null,
  headerRight: DismissPopupButton,
  title: getText(I18N.lockedTokensTotalValue),
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

const HomeStack = memo(() => {
  return (
    <Stack.Navigator
      screenOptions={navigatorOptions}
      initialRouteName={HomeStackRoutes.Home}>
      <Stack.Screen
        component={themeUpdaterHOC(HomeScreen)}
        name={HomeStackRoutes.Home}
        options={basicScreenOptions}
      />
      <Stack.Screen
        name={HomeStackRoutes.AccountInfo}
        component={AccountInfoScreen}
        options={getWalletTitle}
      />

      <Stack.Screen
        name={HomeStackRoutes.Transaction}
        component={TransactionStack}
        options={modalOptions}
      />

      <Stack.Screen
        name={HomeStackRoutes.AccountDetail}
        component={AccountDetailScreen}
        options={fullScreenModalOptions}
      />

      <Stack.Screen
        name={HomeStackRoutes.Backup}
        component={BackupStack}
        options={modalOptions}
      />

      <Stack.Screen
        name={HomeStackRoutes.WalletProtectionPopup}
        component={WalletProtectionPopupScreen}
        options={modalOptions}
      />

      <Stack.Screen
        name={HomeStackRoutes.WalletConnectApplicationDetailsPopup}
        component={WalletConnectApplicationDetailsPopupScreen}
        options={modalOptions}
      />

      <Stack.Screen
        name={HomeStackRoutes.WalletConnectApplicationListPopup}
        component={WalletConnectApplicationListPopupScreen}
        options={modalOptions}
      />

      <Stack.Screen
        name={HomeStackRoutes.TransactionDetail}
        component={TransactionDetailScreen}
        options={fullScreenModalOptions}
      />

      <Stack.Screen
        name={HomeStackRoutes.InAppBrowser}
        component={InAppBrowserScreen}
        options={inAppBrowserOptions}
      />

      <Stack.Screen
        name={HomeStackRoutes.WalletConnect}
        component={WalletConnectApprovalStack}
        options={modalOptions}
      />

      <Stack.Screen
        name={HomeStackRoutes.SssMigrate}
        component={SssMigrateStack}
        options={modalOptions}
      />

      <Stack.Screen
        name={HomeStackRoutes.BackupNotification}
        component={BackupNotificationScreen}
        options={fullScreenModalOptions}
      />

      <Stack.Screen
        name={HomeStackRoutes.JsonRpcSign}
        component={themeUpdaterHOC(JsonRpcSignPopupStack)}
        options={fullScreenModalOptions}
      />

      <Stack.Screen
        name={HomeStackRoutes.BackupSssNotification}
        component={BackupSssNotificationScreen}
        options={fullScreenModalOptions}
      />

      <Stack.Screen
        name={HomeStackRoutes.PopupNotificationNews}
        component={PopupNotificationNewsScreen}
        options={fullScreenModalOptions}
      />

      <Stack.Screen
        name={HomeStackRoutes.PopupNotification}
        component={PopupNotificationScreen}
        options={fullScreenModalOptions}
      />

      <Stack.Screen
        name={HomeStackRoutes.PopupTrackActivity}
        component={PopupTrackActivityScreen}
        options={fullScreenModalOptions}
      />

      <Stack.Screen
        name={HomeStackRoutes.Web3BrowserPopup}
        component={Web3BrowserPopupScreen}
        options={modalOptions}
      />

      <Stack.Screen
        name={HomeStackRoutes.Create}
        component={CreateStack}
        options={modalOptions}
      />
      <Stack.Screen
        name={HomeStackRoutes.Ledger}
        component={LedgerStack}
        options={modalOptions}
      />
      <Stack.Screen
        name={HomeStackRoutes.SignIn}
        component={SignInStack}
        options={modalOptions}
      />

      <Stack.Screen
        name={HomeStackRoutes.ValueSelector}
        component={ValueSelectorScreen}
        options={modalOptions}
      />

      <Stack.Screen
        name={HomeStackRoutes.TotalValueInfo}
        component={TotalValueInfoScreen}
        options={totalInfoOptions}
      />

      <Stack.Screen
        name={HomeStackRoutes.WalletSelector}
        component={WalletSelectorScreen}
        options={modalOptions}
      />
    </Stack.Navigator>
  );
});

export {HomeStack};
