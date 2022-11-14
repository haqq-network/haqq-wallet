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

import NetInfo, {NetInfoState} from '@react-native-community/netinfo';
import {
  DefaultTheme,
  NavigationContainer,
  StackActions,
  createNavigationContainerRef,
} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {AppState, Linking} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import SplashScreen from 'react-native-splash-screen';

import {
  Notifications,
  PopupHeader,
  SettingsAccountRemoveButton,
} from '@app/components';
import {StatusBarColor} from '@app/components/ui';
import {
  AppContext,
  TransactionsContext,
  WalletsContext,
  app,
  transactions,
  wallets,
} from '@app/contexts';
import {hideModal, showModal} from '@app/helpers';
import {migration} from '@app/models/migration';
import {BackupScreen} from '@app/screens/backup';
import {BackupNotificationScreen} from '@app/screens/backup-notification';
import {CreateScreen} from '@app/screens/create';
import {DetailsQrScreen} from '@app/screens/details-qr';
import {HomeScreen} from '@app/screens/home';
import {LedgerScreen} from '@app/screens/ledger';
import {Modals} from '@app/screens/modals';
import {RestoreScreen} from '@app/screens/restore';
import {SettingsAboutScreen} from '@app/screens/settings-about';
import {SettingsAccountDetailScreen} from '@app/screens/settings-account-detail';
import {SettingsAccountStyleScreen} from '@app/screens/settings-account-style';
import {SettingsAccountsScreen} from '@app/screens/settings-accounts';
import {SettingsAddressBookScreen} from '@app/screens/settings-address-book';
import {SettingsFAQScreen} from '@app/screens/settings-faq';
import {SettingsLanguageScreen} from '@app/screens/settings-language';
import {SettingsProvidersScreen} from '@app/screens/settings-providers';
import {SettingsSecurityScreen} from '@app/screens/settings-security';
import {SettingsSecurityPinScreen} from '@app/screens/settings-security-pin';
import {SettingsTestScreen} from '@app/screens/settings-test';
import {SignInScreen} from '@app/screens/signin';
import {SignUpScreen} from '@app/screens/signup';
import {TransactionScreen} from '@app/screens/transaction';
import {TransactionDetailScreen} from '@app/screens/transaction-detail';
import {WelcomeScreen} from '@app/screens/welcome';
import {
  ActionSheetType,
  HeaderButtonProps,
  PresentationNavigation,
  RootStackParamList,
  ScreenOptionType,
} from '@app/types';
import {sleep} from '@app/utils';
import {LIGHT_BG_1, LIGHT_GRAPHIC_GREEN_1} from '@app/variables';

const screenOptions: ScreenOptionType = {
  tab: true,
  gestureEnabled: false,
  headerBackVisible: true,
  headerShown: true,
  header: PopupHeader,
  headerStyle: {
    height: 56,
  },
};

const Stack = createStackNavigator();

const AppTheme = {
  dark: false,
  colors: {
    ...DefaultTheme.colors,
    primary: LIGHT_GRAPHIC_GREEN_1,
    background: LIGHT_BG_1,
  },
};

const actionsSheet: ActionSheetType = {
  presentation: 'transparentModal' as PresentationNavigation,
  animation: 'fade',
  animationDuration: 0,
};

export const navigator = createNavigationContainerRef<RootStackParamList>();

const basicScreenOptions = {
  headerShown: false,
  gestureEnabled: false,
};
const stackScreenOptions = {
  presentation: 'modal',
  gestureEnabled: false,
};
export const App = () => {
  useEffect(() => {
    showModal('splash');
    sleep(150)
      .then(() => SplashScreen.hide())
      .then(() => migration())
      .then(() => app.init())
      .then(() => wallets.init(app.snoozeBackup))
      .then(() => transactions.init())
      .catch(e => {
        switch (e) {
          case 'user_not_found':
            navigator.navigate('welcome');
            break;
          default:
            if (e instanceof Error) {
              console.log('Error', e.name, e.message);
            }
        }
      })
      .finally(async () => {
        const initialUrl = await Linking.getInitialURL();

        if (initialUrl && initialUrl.startsWith('haqq:')) {
          navigator.navigate('transaction', {
            to: initialUrl.substring(5),
          });
        }

        hideModal();

        setInitialized(true);
        requestAnimationFrame(() => {
          wallets.addressList.forEach(d => app.emit('addWallet', d));
        });
      });

    app.on('resetWallet', () => {
      navigator.dispatch(StackActions.replace('welcome'));
      hideModal();
    });
  }, []);

  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (initialized) {
      const subscription = ({isConnected}: NetInfoState) => {
        isConnected ? hideModal('no-internet') : showModal('no-internet');
      };

      NetInfo.fetch().then(subscription);
      const unsubscribeNet = NetInfo.addEventListener(subscription);
      const unsubscribeApp = AppState.addEventListener('change', () => {
        if (AppState.currentState === 'active') {
          NetInfo.fetch().then(subscription);
        }
      });

      return () => {
        unsubscribeNet();
        unsubscribeApp.remove();
      };
    }
  }, [initialized]);

  return (
    <SafeAreaProvider>
      <AppContext.Provider value={app}>
        <StatusBarColor barStyle="dark-content" />
        <TransactionsContext.Provider value={transactions}>
          <WalletsContext.Provider value={wallets}>
            <NavigationContainer ref={navigator} theme={AppTheme}>
              <Stack.Navigator screenOptions={basicScreenOptions}>
                <Stack.Screen name="home" component={HomeScreen} />
                <Stack.Screen name="welcome" component={WelcomeScreen} />

                <Stack.Group screenOptions={stackScreenOptions}>
                  <Stack.Screen name="backup" component={BackupScreen} />
                  <Stack.Screen name="signin" component={SignInScreen} />
                  <Stack.Screen name="signup" component={SignUpScreen} />
                  <Stack.Screen
                    name="transaction"
                    component={TransactionScreen}
                  />
                  <Stack.Screen name="restore" component={RestoreScreen} />
                  <Stack.Screen name="create" component={CreateScreen} />
                  <Stack.Screen name="ledger" component={LedgerScreen} />
                </Stack.Group>
                <Stack.Screen
                  name="detailsQr"
                  component={DetailsQrScreen}
                  options={actionsSheet}
                />
                <Stack.Screen
                  name="backupNotification"
                  component={BackupNotificationScreen}
                  options={actionsSheet}
                />
                <Stack.Screen
                  name="transactionDetail"
                  component={TransactionDetailScreen}
                  options={actionsSheet}
                />
                <Stack.Group screenOptions={screenOptions}>
                  <Stack.Screen
                    name="settingsAccounts"
                    component={SettingsAccountsScreen}
                    options={{
                      title: 'Manage accounts',
                    }}
                  />
                  <Stack.Screen
                    name="settingsAccountDetail"
                    component={SettingsAccountDetailScreen}
                    options={{
                      title: 'Account details',
                      headerRight: (
                        props: HeaderButtonProps,
                      ): React.ReactNode => (
                        <SettingsAccountRemoveButton
                          address={props?.route?.params?.address!} // non-null assertion in TypeScript
                        />
                      ),
                    }}
                  />
                  <Stack.Screen
                    name="settingsAccountStyle"
                    component={SettingsAccountStyleScreen}
                    options={{
                      title: 'Change style',
                    }}
                  />
                  <Stack.Screen
                    name="settingsAddressBook"
                    component={SettingsAddressBookScreen}
                    options={{
                      title: 'Address book',
                    }}
                  />
                  <Stack.Screen
                    name="settingsLanguage"
                    component={SettingsLanguageScreen}
                    options={{
                      title: 'Language',
                    }}
                  />
                  <Stack.Screen
                    name="settingsSecurity"
                    component={SettingsSecurityScreen}
                    options={{
                      title: 'Security',
                    }}
                  />
                  <Stack.Screen
                    name="settingsProviders"
                    component={SettingsProvidersScreen}
                    options={{
                      title: 'Providers',
                    }}
                  />
                  <Stack.Screen
                    name="settingsSecurityPin"
                    component={SettingsSecurityPinScreen}
                    options={{
                      title: 'Change PIN',
                    }}
                  />
                  <Stack.Screen
                    name="settingsFaq"
                    component={SettingsFAQScreen}
                    options={{
                      title: 'Security',
                    }}
                  />
                  <Stack.Screen
                    name="settingsAbout"
                    component={SettingsAboutScreen}
                    options={{
                      title: 'About',
                    }}
                  />
                  <Stack.Screen
                    name="settingsTest"
                    component={SettingsTestScreen}
                    options={{
                      title: 'Test',
                    }}
                  />
                </Stack.Group>
              </Stack.Navigator>
            </NavigationContainer>
            <Modals initialModal={{type: 'splash'}} />
            <Notifications />
          </WalletsContext.Provider>
        </TransactionsContext.Provider>
      </AppContext.Provider>
    </SafeAreaProvider>
  );
};
