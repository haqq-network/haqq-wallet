import React, {memo} from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {TransitionPresets} from '@react-navigation/stack';
import {SessionTypes} from '@walletconnect/types';
import {StatusBar} from 'react-native';

import {Spacer} from '@app/components/ui';
import {popupScreenOptions} from '@app/helpers';
import {getWalletTitle} from '@app/helpers/get-wallet-title';
import {themeUpdaterHOC} from '@app/helpers/theme-updater-hoc';
import {basicScreenOptions} from '@app/screens';
import {AccountDetailScreen} from '@app/screens/HomeStack/account-detail';
import {BackupStack} from '@app/screens/HomeStack/BackupStack';
import {HomeScreen} from '@app/screens/HomeStack/home';
import {AccountInfoScreen} from '@app/screens/HomeStack/HomeFeedStack/account-info';
import {CreateStack} from '@app/screens/HomeStack/HomeFeedStack/create';
import {TransactionDetailScreen} from '@app/screens/HomeStack/HomeFeedStack/transaction-detail';
import {InAppBrowserScreen} from '@app/screens/HomeStack/in-app-browser';
import {TransactionStack} from '@app/screens/HomeStack/TransactionStack';
import {WalletProtectionPopupScreen} from '@app/screens/HomeStack/wallet-protection-popup';
import {ModalsScreen} from '@app/screens/modals-screen';
import {WalletConnectApplicationDetailsPopupScreen} from '@app/screens/wallet-connect-application-details-popup';
import {WalletConnectApplicationListPopupScreen} from '@app/screens/wallet-connect-application-list-popup';
import {LedgerStack} from '@app/screens/WelcomeStack/LedgerStack';
import {SignInStack} from '@app/screens/WelcomeStack/SignInStack';
import {NftItem} from '@app/types';

export enum HomeStackRoutes {
  Home = 'home',
  Modal = 'modal',
  Create = 'create',
  Ledger = 'ledger',
  SignIn = 'signin',
  AccountInfo = 'accountInfo',
  Transaction = 'transaction',
  AccountDetail = 'accountDetail',
  Backup = 'backup',
  WalletProtectionPopup = 'walletProtectionPopup',
  WalletConnectApplicationDetailsPopup = 'walletConnectApplicationDetailsPopup',
  WalletConnectApplicationListPopup = 'walletConnectApplicationListPopup',
  TransactionDetail = 'transactionDetail',
  InAppBrowser = 'inAppBrowser',
}

export type HomeStackParamList = {
  [HomeStackRoutes.Home]: undefined;
  [HomeStackRoutes.Modal]: undefined;
  [HomeStackRoutes.Create]: undefined;
  [HomeStackRoutes.Ledger]: undefined;
  [HomeStackRoutes.SignIn]: undefined;
  [HomeStackRoutes.AccountInfo]: {accountId: string};
  [HomeStackRoutes.Transaction]: {
    from?: string | boolean;
    to?: string;
    nft?: NftItem;
  };
  [HomeStackRoutes.AccountDetail]: {address: string};
  [HomeStackRoutes.Backup]: {accountId: string};
  [HomeStackRoutes.WalletProtectionPopup]: {accountId: string};
  [HomeStackRoutes.WalletConnectApplicationDetailsPopup]: {
    session: SessionTypes.Struct;
    isPopup?: boolean;
  };
  [HomeStackRoutes.WalletConnectApplicationListPopup]: {
    address: string;
    isPopup?: boolean;
  };
  [HomeStackRoutes.TransactionDetail]: {hash: string};
  [HomeStackRoutes.InAppBrowser]: {
    url: string;
    title?: string;
  };
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

const HomeStack = memo(() => {
  return (
    <>
      <Stack.Navigator
        screenOptions={{
          gestureEnabled: false,
          freezeOnBlur: true,
        }}
        initialRouteName={HomeStackRoutes.Home}>
        <Stack.Screen
          component={themeUpdaterHOC(HomeScreen)}
          name={HomeStackRoutes.Home}
          options={basicScreenOptions}
        />
        <Stack.Screen
          name={HomeStackRoutes.Create}
          component={CreateStack}
          options={{
            ...popupScreenOptions,
            presentation: 'modal',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name={HomeStackRoutes.Ledger}
          component={LedgerStack}
          options={{
            ...popupScreenOptions,
            presentation: 'modal',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name={HomeStackRoutes.SignIn}
          component={SignInStack}
          options={{
            ...popupScreenOptions,
            presentation: 'modal',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name={HomeStackRoutes.AccountInfo}
          component={AccountInfoScreen}
          options={getWalletTitle}
        />

        <Stack.Screen
          name={HomeStackRoutes.Transaction}
          component={TransactionStack}
          options={{
            ...popupScreenOptions,
            presentation: 'modal',
            headerShown: false,
          }}
        />

        <Stack.Screen
          name={HomeStackRoutes.AccountDetail}
          component={AccountDetailScreen}
          options={{
            headerShown: false,
            presentation: 'transparentModal',
            animation: 'fade',
            animationDuration: 0,
          }}
        />

        <Stack.Screen
          name={HomeStackRoutes.Backup}
          component={BackupStack}
          options={{
            ...popupScreenOptions,
            presentation: 'modal',
            headerShown: false,
          }}
        />

        <Stack.Screen
          name={HomeStackRoutes.WalletProtectionPopup}
          component={WalletProtectionPopupScreen}
          options={{
            ...popupScreenOptions,
            headerShown: false,
            presentation: 'modal',
          }}
        />

        <Stack.Screen
          name={HomeStackRoutes.WalletConnectApplicationDetailsPopup}
          component={WalletConnectApplicationDetailsPopupScreen}
          options={{
            ...popupScreenOptions,
            headerShown: false,
            presentation: 'modal',
          }}
        />

        <Stack.Screen
          name={HomeStackRoutes.WalletConnectApplicationListPopup}
          component={WalletConnectApplicationListPopupScreen}
          options={{
            ...popupScreenOptions,
            headerShown: false,
            presentation: 'modal',
          }}
        />

        <Stack.Screen
          name={HomeStackRoutes.TransactionDetail}
          component={TransactionDetailScreen}
          options={{
            headerShown: false,
            presentation: 'transparentModal',
            animation: 'fade',
            animationDuration: 0,
          }}
        />

        <Stack.Screen
          name={HomeStackRoutes.InAppBrowser}
          component={InAppBrowserScreen}
          options={{
            headerBackHidden: true,
            headerShown: true,
            gestureEnabled: false,
            header: () => <Spacer height={StatusBar.currentHeight} />,
            headerBackground: () => <Spacer height={StatusBar.currentHeight} />,
            ...TransitionPresets.ModalSlideFromBottomIOS,
          }}
        />
      </Stack.Navigator>
      <ModalsScreen />
    </>
  );
});

export {HomeStack};
