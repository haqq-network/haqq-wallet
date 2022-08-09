/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {HomeScreen} from './screens/home';
import {wallets, WalletsContext} from './contexts/wallets';
import {DetailsScreen} from './screens/details';
import {SplashScreen} from './screens/splash';
import {LoginScreen} from './screens/login';
import {PasswordScreen} from './screens/password';
import {RegisterScreen} from './screens/register';
import {CreateWalletScreen} from './screens/create-wallet';
import {CreateWalletVerifyScreen} from './screens/create-wallet-verify';
import {RestoreScreen} from './screens/restore';
import {ImportWalletScreen} from './screens/import-wallet';
import {SendTransactionScreen} from './screens/send-transaction';
import {DetailsQrScreen} from './screens/details-qr';
import {app, AppContext} from './contexts/app';
import {PinScreen} from './screens/pin';
import {SettingsScreen} from './screens/settings';
import {SetPinScreen} from './screens/set-pin';

const Stack = createNativeStackNavigator();

export const App = () => {
  return (
    <AppContext.Provider value={app}>
      <WalletsContext.Provider value={wallets}>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{headerShown: false}}>
            <Stack.Screen name="splash" component={SplashScreen} />
            <Stack.Screen name="pin" component={PinScreen} />
            <Stack.Screen name="home" component={HomeScreen} />
            <Stack.Group screenOptions={{presentation: 'modal'}}>
              <Stack.Screen name="details" component={DetailsScreen} />
              <Stack.Screen name="details-qr" component={DetailsQrScreen} />
              <Stack.Screen
                name="import-wallet"
                component={ImportWalletScreen}
              />
              <Stack.Screen
                name="send-transaction"
                component={SendTransactionScreen}
              />
              <Stack.Screen name="settings" component={SettingsScreen} />
              <Stack.Screen name="set-pin" component={SetPinScreen} />
            </Stack.Group>
            <Stack.Screen name="login" component={LoginScreen} />
            <Stack.Screen name="restore" component={RestoreScreen} />
            <Stack.Screen name="register" component={RegisterScreen} />
            <Stack.Screen name="create-wallet" component={CreateWalletScreen} />
            <Stack.Screen
              name="create-wallet-verify"
              component={CreateWalletVerifyScreen}
            />
            <Stack.Screen name="password" component={PasswordScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </WalletsContext.Provider>
    </AppContext.Provider>
  );
};
