import React, {memo} from 'react';

import {
  NativeStackNavigationOptions,
  createNativeStackNavigator,
} from '@react-navigation/native-stack';
import {StatusBar} from 'react-native';

import {Color} from '@app/colors';
import {DismissPopupButton} from '@app/components/popup/dismiss-popup-button';
import {Spacer} from '@app/components/ui';
import {popupScreenOptionsWithMargin} from '@app/helpers';
import {getNewsDetailAppTitle} from '@app/helpers/get-news-detail-title';
import {getWalletTitle} from '@app/helpers/get-wallet-title';
import {themeUpdaterHOC} from '@app/helpers/theme-updater-hoc';
import {AppStore} from '@app/models/app';
import {HomeStackParamList, HomeStackRoutes} from '@app/route-types';
import {basicScreenOptions} from '@app/screens';
import {DeviceStack} from '@app/screens/DeviceStack';
import {BackupStack} from '@app/screens/HomeStack/BackupStack';
import {HomeScreen} from '@app/screens/HomeStack/home';
import {AccountInfoScreen} from '@app/screens/HomeStack/HomeFeedStack/account-info';
import {CreateStack} from '@app/screens/HomeStack/HomeFeedStack/create';
import {TransactionDetailScreen} from '@app/screens/HomeStack/HomeFeedStack/transaction-detail';
import {InAppBrowserScreen} from '@app/screens/HomeStack/in-app-browser';
import {JsonRpcSignPopupStack} from '@app/screens/HomeStack/JsonRpcSignPopupStack';
import {NftStack} from '@app/screens/HomeStack/NftStack';
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
import {SignInStack} from '@app/screens/WelcomeStack/SignInStack';

import {NewsDetailScreen} from './HomeNewsStack/news-detail';
import {ReceiveScreen, SelectNetworkScreen} from './ReceiveStack';
import {FeeSettingsScreen} from './TransactionStack/fee-settings';

import {NetworkLoggerScreen} from '../network-logger';
import {SwapStack} from '../SwapStack';
import {SignUpStack} from '../WelcomeStack/SignUpStack';

const navigatorOptions: NativeStackNavigationOptions = {
  gestureEnabled: false,
  freezeOnBlur: true,
  animation: AppStore.isDetoxRunning ? 'none' : 'default',
  animationDuration: AppStore.isDetoxRunning ? 0 : 350,
};

const modalOptions: NativeStackNavigationOptions = {
  ...popupScreenOptionsWithMargin,
  presentation: 'modal',
  headerShown: false,
  gestureEnabled: true,
  gestureDirection: 'vertical',
  animation: 'slide_from_bottom',
};

const fullScreenModalOptions: NativeStackNavigationOptions = {
  headerShown: false,
  presentation: 'transparentModal',
  animation: 'fade',
};

export const inAppBrowserOptions: NativeStackNavigationOptions = {
  //@ts-ignore
  headerBackHidden: true,
  headerShown: true,
  gestureEnabled: false,
  header: () => <Spacer height={StatusBar.currentHeight} bg={Color.bg1} />,
  presentation: 'fullScreenModal',
};

const web3BrowserOptions: NativeStackNavigationOptions = {
  ...modalOptions,
  gestureEnabled: false,
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
        component={themeUpdaterHOC(AccountInfoScreen)}
        options={getWalletTitle}
      />

      <Stack.Screen
        name={HomeStackRoutes.Transaction}
        component={TransactionStack}
        options={modalOptions}
      />

      <Stack.Screen
        name={HomeStackRoutes.SelectNetwork}
        component={themeUpdaterHOC(SelectNetworkScreen)}
        options={fullScreenModalOptions}
      />

      <Stack.Screen
        name={HomeStackRoutes.Receive}
        component={themeUpdaterHOC(ReceiveScreen)}
        options={fullScreenModalOptions}
      />

      <Stack.Screen
        name={HomeStackRoutes.Backup}
        component={BackupStack}
        options={modalOptions}
      />

      <Stack.Screen
        name={HomeStackRoutes.NetworkLogger}
        component={NetworkLoggerScreen}
        options={modalOptions}
      />

      <Stack.Screen
        name={HomeStackRoutes.WalletProtectionPopup}
        component={themeUpdaterHOC(WalletProtectionPopupScreen)}
        options={modalOptions}
      />

      <Stack.Screen
        name={HomeStackRoutes.WalletConnectApplicationDetailsPopup}
        component={themeUpdaterHOC(WalletConnectApplicationDetailsPopupScreen)}
        options={modalOptions}
      />

      <Stack.Screen
        name={HomeStackRoutes.WalletConnectApplicationListPopup}
        component={themeUpdaterHOC(WalletConnectApplicationListPopupScreen)}
        options={modalOptions}
      />

      <Stack.Screen
        name={HomeStackRoutes.TransactionDetail}
        component={themeUpdaterHOC(TransactionDetailScreen)}
        options={fullScreenModalOptions}
      />

      <Stack.Screen
        name={HomeStackRoutes.Nft}
        component={NftStack}
        options={modalOptions}
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
        component={themeUpdaterHOC(BackupNotificationScreen)}
        options={fullScreenModalOptions}
      />

      <Stack.Screen
        name={HomeStackRoutes.JsonRpcSign}
        component={JsonRpcSignPopupStack}
        options={fullScreenModalOptions}
      />

      <Stack.Screen
        name={HomeStackRoutes.BackupSssNotification}
        component={themeUpdaterHOC(BackupSssNotificationScreen)}
        options={fullScreenModalOptions}
      />

      <Stack.Screen
        name={HomeStackRoutes.PopupNotificationNews}
        component={themeUpdaterHOC(PopupNotificationNewsScreen)}
        options={fullScreenModalOptions}
      />

      <Stack.Screen
        name={HomeStackRoutes.PopupNotification}
        component={themeUpdaterHOC(PopupNotificationScreen)}
        options={fullScreenModalOptions}
      />

      <Stack.Screen
        name={HomeStackRoutes.PopupTrackActivity}
        component={themeUpdaterHOC(PopupTrackActivityScreen)}
        options={fullScreenModalOptions}
      />

      <Stack.Screen
        name={HomeStackRoutes.Web3BrowserPopup}
        component={themeUpdaterHOC(Web3BrowserPopupScreen)}
        options={web3BrowserOptions}
      />

      <Stack.Screen
        name={HomeStackRoutes.Create}
        component={CreateStack}
        options={modalOptions}
      />
      <Stack.Screen
        name={HomeStackRoutes.Device}
        component={DeviceStack}
        options={modalOptions}
      />
      <Stack.Screen
        name={HomeStackRoutes.SignIn}
        component={SignInStack}
        options={modalOptions}
      />
      <Stack.Screen
        name={HomeStackRoutes.SignUp}
        component={SignUpStack}
        options={modalOptions}
      />
      <Stack.Screen
        name={HomeStackRoutes.ValueSelector}
        component={themeUpdaterHOC(ValueSelectorScreen)}
        options={modalOptions}
      />

      <Stack.Screen
        name={HomeStackRoutes.TotalValueInfo}
        component={themeUpdaterHOC(TotalValueInfoScreen)}
        options={{
          ...modalOptions,
          headerStyle: undefined,
          headerShown: true,
          headerLeft: () => null,
          headerRight: DismissPopupButton,
        }}
      />

      <Stack.Screen
        name={HomeStackRoutes.WalletSelector}
        component={themeUpdaterHOC(WalletSelectorScreen)}
        options={modalOptions}
      />

      <Stack.Screen
        name={HomeStackRoutes.FeeSettings}
        component={themeUpdaterHOC(FeeSettingsScreen)}
        options={{
          ...modalOptions,
          headerShown: true,
        }}
      />

      <Stack.Screen
        name={HomeStackRoutes.InAppBrowser}
        component={themeUpdaterHOC(InAppBrowserScreen)}
        options={inAppBrowserOptions}
      />
      <Stack.Screen
        name={HomeStackRoutes.Swap}
        component={SwapStack}
        options={modalOptions}
      />
      <Stack.Screen
        name={HomeStackRoutes.NewsDetailPushNotification}
        component={themeUpdaterHOC(NewsDetailScreen)}
        options={props => ({
          ...getNewsDetailAppTitle(props),
          disableMargin: false,
        })}
      />
    </Stack.Navigator>
  );
});

export {HomeStack};
