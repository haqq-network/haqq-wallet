/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React, {useEffect, useState} from 'react';
import {
  DefaultTheme,
  NavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {HomeScreen} from './screens/home';
import {wallets, WalletsContext} from './contexts/wallets';
import {DetailsScreen} from './screens/details';
import {SplashScreen} from './screens/splash';
import {RegisterScreen} from './screens/register';
import {RestoreScreen} from './screens/restore';
import {ImportWalletScreen} from './screens/import-wallet';
import {DetailsQrScreen} from './screens/details-qr';
import {app, AppContext} from './contexts/app';
import {SetPinScreen} from './screens/set-pin';
import {ScanQrScreen} from './screens/scan-qr';
import {SignInScreen} from './screens/signin';
import {transactions, TransactionsContext} from './contexts/transactions';
import {TransactionScreen} from './screens/transaction';
import {LoginScreen} from './screens/login';
import {BG_1, GRAPHIC_GREEN_1} from './variables';
import {RootStackParamList} from './types';
import {BackupScreen} from './screens/backup';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppTheme = {
  dark: false,
  colors: {
    ...DefaultTheme.colors,
    primary: GRAPHIC_GREEN_1,
    background: BG_1,
  },
};

export const App = () => {
  const navigator = useNavigationContainerRef<RootStackParamList>();
  const [appLoading, setAppLoading] = useState(true);
  useEffect(() => {
    app
      .init()
      .then(() => Promise.all([wallets.init(), transactions.init()]))
      .catch(() => {
        navigator.navigate('login');
      })
      .finally(() => {
        setAppLoading(false);
      });

    app.on('resetWallet', () => {
      app.emit('showPin', false);
      navigator.navigate('login');
      setAppLoading(false);
    });
  }, [navigator]);

  return (
    <AppContext.Provider value={app}>
      <TransactionsContext.Provider value={transactions}>
        <WalletsContext.Provider value={wallets}>
          <NavigationContainer ref={navigator} theme={AppTheme}>
            <Stack.Navigator screenOptions={{headerShown: false}}>
              <Stack.Screen name="home" component={HomeScreen} />
              <Stack.Screen name="login" component={LoginScreen} />

              <Stack.Group screenOptions={{presentation: 'modal'}}>
                <Stack.Screen name="backup" component={BackupScreen} />
                <Stack.Screen name="details" component={DetailsScreen} />
                <Stack.Screen name="detailsQr" component={DetailsQrScreen} />
                <Stack.Screen name="scanQr" component={ScanQrScreen} />
                <Stack.Screen
                  name="importWallet"
                  component={ImportWalletScreen}
                />
                <Stack.Screen name="setPin" component={SetPinScreen} />
                <Stack.Screen name="signin" component={SignInScreen} />
                <Stack.Screen
                  name="transaction"
                  component={TransactionScreen}
                />
              </Stack.Group>
              <Stack.Screen name="restore" component={RestoreScreen} />
              <Stack.Screen name="register" component={RegisterScreen} />
            </Stack.Navigator>
            <SplashScreen visible={appLoading} />
          </NavigationContainer>
        </WalletsContext.Provider>
      </TransactionsContext.Provider>
    </AppContext.Provider>
  );
};
