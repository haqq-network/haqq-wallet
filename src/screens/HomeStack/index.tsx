import React, {memo} from 'react';

import {FOR_DETOX} from '@env';
import {
  NativeStackNavigationOptions,
  createNativeStackNavigator,
} from '@react-navigation/native-stack';
import {StatusBar} from 'react-native';

import {Color} from '@app/colors';
import {DismissPopupButton} from '@app/components/popup/dismiss-popup-button';
import {Spacer} from '@app/components/ui';
import {popupScreenOptionsWithMargin} from '@app/helpers';
import {getWalletTitle} from '@app/helpers/get-wallet-title';
import {themeUpdaterHOC} from '@app/helpers/theme-updater-hoc';
import {I18N, getText} from '@app/i18n';
import {HomeStackParamList, HomeStackRoutes} from '@app/route-types';
import {basicScreenOptions} from '@app/screens';
import {DeviceStack} from '@app/screens/DeviceStack';
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
import {SignInStack} from '@app/screens/WelcomeStack/SignInStack';

const navigatorOptions: NativeStackNavigationOptions = {
  gestureEnabled: false,
  freezeOnBlur: true,
  animation: FOR_DETOX ? 'none' : 'default',
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

export const inAppBrowserOptions: NativeStackNavigationOptions = {
  //@ts-ignore
  headerBackHidden: true,
  headerShown: true,
  gestureEnabled: false,
  header: () => <Spacer height={StatusBar.currentHeight} bg={Color.bg1} />,
  presentation: 'fullScreenModal',
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
        component={themeUpdaterHOC(AccountInfoScreen)}
        options={getWalletTitle}
      />

      <Stack.Screen
        name={HomeStackRoutes.Transaction}
        component={TransactionStack}
        options={modalOptions}
      />

      <Stack.Screen
        name={HomeStackRoutes.AccountDetail}
        component={themeUpdaterHOC(AccountDetailScreen)}
        options={fullScreenModalOptions}
      />

      <Stack.Screen
        name={HomeStackRoutes.Backup}
        component={BackupStack}
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
        options={modalOptions}
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
        name={HomeStackRoutes.ValueSelector}
        component={themeUpdaterHOC(ValueSelectorScreen)}
        options={modalOptions}
      />

      <Stack.Screen
        name={HomeStackRoutes.TotalValueInfo}
        component={themeUpdaterHOC(TotalValueInfoScreen)}
        options={totalInfoOptions}
      />

      <Stack.Screen
        name={HomeStackRoutes.WalletSelector}
        component={themeUpdaterHOC(WalletSelectorScreen)}
        options={modalOptions}
      />

      <Stack.Screen
        name={HomeStackRoutes.InAppBrowser}
        component={themeUpdaterHOC(InAppBrowserScreen)}
        options={inAppBrowserOptions}
      />
    </Stack.Navigator>
  );
});

export {HomeStack};
