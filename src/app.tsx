/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React, {useEffect, useMemo, useState} from 'react';

import NetInfo, {NetInfoState} from '@react-native-community/netinfo';
import {
  DefaultTheme,
  NavigationContainer,
  StackActions,
  Theme,
  createNavigationContainerRef,
} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {AppState, Linking} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import SplashScreen from 'react-native-splash-screen';

import {Color, getColor} from '@app/colors';
import {
  Notifications,
  PopupHeader,
  SettingsAccountRemoveButton,
} from '@app/components';
import {
  AppContext,
  TransactionsContext,
  WalletsContext,
  app,
  transactions,
  wallets,
} from '@app/contexts';
import {createTheme, hideModal, showModal} from '@app/helpers';
import {useTheme} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {ProposalScreen} from '@app/screens/proposal';
import {StakingDelegateScreen} from '@app/screens/staking-delegate';
import {StakingInfoScreen} from '@app/screens/staking-info';
import {StakingUnDelegateScreen} from '@app/screens/staking-undelegate';
import {StakingValidatorsScreen} from '@app/screens/staking-validators';
import {
  ActionSheetType,
  AppTheme,
  HeaderButtonProps,
  PresentationNavigation,
  RootStackParamList,
  ScreenOptionType,
} from '@app/types';
import {sleep} from '@app/utils';

import {StatusBarColor} from './components/ui';
import {BackupScreen} from './screens/backup';
import {CreateScreen} from './screens/create';
import {DetailsQrScreen} from './screens/details-qr';
import {HomeScreen} from './screens/home';
import {LedgerScreen} from './screens/ledger';
import {Modals} from './screens/modals';
import {BackupNotificationScreen} from './screens/popup-backup-notification';
import {NotificationPopupScreen} from './screens/popup-notification';
import {TrackActivityScreen} from './screens/popup-track-activity';
import {RestoreScreen} from './screens/restore';
import {SettingsAboutScreen} from './screens/settings-about';
import {SettingsAccountDetailScreen} from './screens/settings-account-detail';
import {SettingsAccountEditScreen} from './screens/settings-account-edit';
import {SettingsAccountStyleScreen} from './screens/settings-account-style';
import {SettingsAccountsScreen} from './screens/settings-accounts';
import {SettingsAddressBookScreen} from './screens/settings-address-book';
import {SettingsContactEditScreen} from './screens/settings-contact-edit';
import {SettingsFAQScreen} from './screens/settings-faq';
import {SettingsLanguageScreen} from './screens/settings-language';
import {SettingsProviderEditScreen} from './screens/settings-provider-edit';
import {SettingsProvidersScreen} from './screens/settings-providers';
import {SettingsSecurityScreen} from './screens/settings-security';
import {SettingsSecurityPinScreen} from './screens/settings-security-pin';
import {SettingsTestScreen} from './screens/settings-test';
import {SettingsThemeScreen} from './screens/settings-theme';
import {SignInScreen} from './screens/signin';
import {SignUpScreen} from './screens/signup';
import {TransactionScreen} from './screens/transaction';
import {TransactionDetailScreen} from './screens/transaction-detail';
import {WelcomeScreen} from './screens/welcome';

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

const appTheme = createTheme({
  colors: {
    ...DefaultTheme.colors,
    primary: Color.graphicGreen1,
    background: Color.bg1,
  },
});

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
  const theme = useTheme();

  const navTheme = useMemo(
    () => ({dark: theme === AppTheme.dark, colors: appTheme.colors} as Theme),
    [theme],
  );

  useEffect(() => {
    showModal('splash');
    sleep(150)
      .then(() => SplashScreen.hide())
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
      app.getUser().onboarded = false;
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

  // @ts-ignore
  return (
    <SafeAreaProvider>
      <AppContext.Provider value={app}>
        <StatusBarColor
          barStyle={theme === AppTheme.dark ? 'light-content' : 'dark-content'}
          backgroundColor={getColor(Color.bg1)}
        />
        <TransactionsContext.Provider value={transactions}>
          <WalletsContext.Provider value={wallets}>
            <NavigationContainer ref={navigator} theme={navTheme}>
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
                  <Stack.Screen
                    name="stakingDelegate"
                    component={StakingDelegateScreen}
                  />
                  <Stack.Screen
                    name="stakingUnDelegate"
                    component={StakingUnDelegateScreen}
                  />
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
                  name="notificationPopup"
                  component={NotificationPopupScreen}
                  options={actionsSheet}
                />
                <Stack.Screen
                  name="trackActivity"
                  component={TrackActivityScreen}
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
                      headerShown: false,
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
                    name="settingsAccountEdit"
                    component={SettingsAccountEditScreen}
                    options={{
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    name="settingsContactEdit"
                    component={SettingsContactEditScreen}
                    options={{
                      headerShown: false,
                    }}
                  />

                  <Stack.Screen
                    name="settingsProviderForm"
                    component={SettingsProviderEditScreen}
                    options={{
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    name="settingsTheme"
                    component={SettingsThemeScreen}
                    options={{
                      title: getText(I18N.settingsThemeScreen),
                    }}
                  />
                </Stack.Group>
                <Stack.Group screenOptions={screenOptions}>
                  <Stack.Screen
                    name="stakingValidators"
                    component={StakingValidatorsScreen}
                    options={{
                      title: getText(I18N.stakingValidators),
                    }}
                  />
                  <Stack.Screen
                    name="stakingInfo"
                    component={StakingInfoScreen}
                    options={{
                      title: getText(I18N.stakingInfo),
                    }}
                  />
                </Stack.Group>
                <Stack.Group screenOptions={screenOptions}>
                  <Stack.Screen
                    name="proposal"
                    component={ProposalScreen}
                    options={{
                      title: getText(I18N.proposalTitle),
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
