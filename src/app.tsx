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
  NavigationContainer,
  useNavigationContainerRef,
  DefaultTheme,
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
import {SignInFinishScreen} from './screens/signin-finish';
// import {BackupScreen} from './screens/backup';

const Stack = createNativeStackNavigator();

// const horizontalAnimation = {
//   headerShown: false,
//   cardStyle: {
//     backgroundColor: 'green',
//   },
//   presentation: 'transparentModal',
//   cardOverlayEnabled: true,
//   animationEnabled: false,
//   overlayStyle: {
//     backgroundColor: 'tomato',
//   },
//   cardStyleInterpolator: ({current: {progress}}) => ({
//     cardStyle: {
//       opacity: progress.interpolate({
//         inputRange: [0, 0.5, 0.9, 1],
//         outputRange: [0, 0.25, 0.7, 1],
//       }),
//     },
//     overlayStyle: {
//       opacity: progress.interpolate({
//         inputRange: [0, 1],
//         outputRange: [0, 0.5],
//         extrapolate: 'clamp',
//       }),
//     },
//   }),
// };

const AppTheme = {
  dark: false,
  colors: {
    ...DefaultTheme.colors,
    primary: '#04D484',
    background: '#fff',
  },
};

export const App = () => {
  const navigator = useNavigationContainerRef();
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
                <Stack.Screen name="details" component={DetailsScreen} />
                <Stack.Screen name="details-qr" component={DetailsQrScreen} />
                <Stack.Screen name="scan-qr" component={ScanQrScreen} />
                <Stack.Screen
                  name="import-wallet"
                  component={ImportWalletScreen}
                />
                <Stack.Screen name="set-pin" component={SetPinScreen} />
                <Stack.Screen name="signin" component={SignInScreen} />
                <Stack.Screen
                  name="transaction"
                  component={TransactionScreen}
                />
              </Stack.Group>
              {/*<Stack.Group screenOptions={horizontalAnimation}>*/}
              {/*  <Stack.Screen name="backup" component={BackupScreen} />*/}
              {/*</Stack.Group>*/}
              <Stack.Screen name="restore" component={RestoreScreen} />
              <Stack.Screen name="register" component={RegisterScreen} />
            </Stack.Navigator>
          </NavigationContainer>
          <SplashScreen visible={appLoading} />
        </WalletsContext.Provider>
      </TransactionsContext.Provider>
    </AppContext.Provider>
  );
};
