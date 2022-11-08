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
  createNavigationContainerRef,
  DefaultTheme,
  NavigationContainer,
  StackActions,
} from '@react-navigation/native';
import SplashScreen from 'react-native-splash-screen';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import NetInfo, {NetInfoState} from '@react-native-community/netinfo';
import {HomeScreen} from './screens/home';
import {wallets, WalletsContext} from './contexts/wallets';
import {CreateScreen} from './screens/create';
import {DetailsQrScreen} from './screens/details-qr';
import {app, AppContext} from './contexts/app';
import {SignInScreen} from './screens/signin';
import {transactions, TransactionsContext} from './contexts/transactions';
import {TransactionScreen} from './screens/transaction';
import {WelcomeScreen} from './screens/welcome';
import {BG_1, GRAPHIC_GREEN_1} from './variables';
import {BackupScreen} from './screens/backup';
import {SignUpScreen} from './screens/signup';
import {Modals} from './screens/modals';
import {createStackNavigator} from '@react-navigation/stack';
import {BackupNotificationScreen} from './screens/backup-notification';
import {SettingsAccountsScreen} from './screens/settings-accounts';
import {PopupHeader} from './components/popup-header';
import {SettingsAddressBookScreen} from './screens/settings-address-book';
import {SettingsLanguageScreen} from './screens/settings-language';
import {SettingsSecurityScreen} from './screens/settings-security';
import {SettingsFAQScreen} from './screens/settings-faq';
import {SettingsAboutScreen} from './screens/settings-about';
import {SettingsAccountDetailScreen} from './screens/settings-account-detail';
import {SettingsAccountStyleScreen} from './screens/settings-account-style';
import {SettingsAccountRemoveButton} from './components/settings-account-remove-button';
import {SettingsSecurityPinScreen} from './screens/settings-security-pin';
import {TransactionDetailScreen} from './screens/transaction-detail';
import {EditAccountNameScreen} from './screens/edit-account-name';
import {RestoreScreen} from './screens/restore';
import {sleep} from './utils';
import {SettingsTestScreen} from './screens/settings-test';
import {Notifications} from './components/notifications';
import {
  ActionSheetType,
  HeaderButtonProps,
  PresentationNavigation,
  RootStackParamList,
  ScreenOptionType,
} from './types';
import {StatusBarColor} from './components/ui';
import {LedgerScreen} from './screens/ledger';
import {migration} from './models/migration';
import {SettingsProvidersScreen} from './screens/settings-providers';
import {AppState, Linking} from 'react-native';
import {hideModal, showModal} from './helpers/modal';
import {EditContactScreen} from './screens/edit-contact';

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
    primary: GRAPHIC_GREEN_1,
    background: BG_1,
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
                  <Stack.Screen
                    name="editAccountName"
                    component={EditAccountNameScreen}
                    options={{
                      title: 'Edit account name',
                    }}
                  />
                  <Stack.Screen
                    name="editContact"
                    component={EditContactScreen}
                    options={{
                      title: 'Edit Contact',
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
