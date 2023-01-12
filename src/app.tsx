/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React, {useCallback, useEffect, useMemo, useState} from 'react';

import NetInfo, {NetInfoState} from '@react-native-community/netinfo';
import {
  DefaultTheme,
  NavigationContainer,
  StackActions,
  Theme,
} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import * as Sentry from '@sentry/react-native';
import {AppState, Linking} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import SplashScreen from 'react-native-splash-screen';

import {Color, getColor} from '@app/colors';
import {PopupHeader} from '@app/components';
import {
  AppContext,
  TransactionsContext,
  WalletsContext,
  app,
  transactions,
  wallets,
} from '@app/contexts';
import {Events} from '@app/events';
import {createTheme, hideModal, showModal} from '@app/helpers';
import {useTheme} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {navigator} from '@app/navigator';
import {ProposalScreen} from '@app/screens/proposal';
import {StakingDelegateScreen} from '@app/screens/staking-delegate';
import {StakingInfoScreen} from '@app/screens/staking-info';
import {StakingUnDelegateScreen} from '@app/screens/staking-undelegate';
import {StakingValidatorsScreen} from '@app/screens/staking-validators';
import {
  ActionSheetType,
  AppTheme,
  PresentationNavigation,
  ScreenOptionType,
  StackPresentationTypes,
} from '@app/types';
import {sleep} from '@app/utils';

import {StatusBarColor} from './components/ui';
import {BackupScreen} from './screens/backup';
import {CreateScreen} from './screens/create';
import {HomeScreen} from './screens/home';
import {LedgerScreen} from './screens/ledger';
import {Modals} from './screens/modals';
import {BackupNotificationScreen} from './screens/popup-backup-notification';
import {NotificationPopupScreen} from './screens/popup-notification';
import {TrackActivityScreen} from './screens/popup-track-activity';
import {ProposalDepositScreen} from './screens/proposal-deposit';
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
import {SettingsViewRecoveryPhraseScreen} from './screens/settings-view-recovery-phrase';
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

const basicScreenOptions = {
  headerShown: false,
  gestureEnabled: false,
};

const stackScreenOptions = {
  presentation: 'modal' as StackPresentationTypes,
  gestureEnabled: false,
};

const withoutHeader = {
  headerShown: false,
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
          app.emit(Events.onDeepLink, initialUrl);
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

      const linkingSubscription = ({url}: {url: string}) => {
        if (url.startsWith('haqq:')) {
          app.emit(Events.onDeepLink, url);
        }
      };

      NetInfo.fetch().then(subscription);

      const unsubscribeLinking = Linking.addListener(
        'url',
        linkingSubscription,
      );
      const unsubscribeNet = NetInfo.addEventListener(subscription);
      const unsubscribeApp = AppState.addEventListener('change', () => {
        if (AppState.currentState === 'active') {
          NetInfo.fetch().then(subscription);
        }
      });

      return () => {
        unsubscribeNet();
        unsubscribeApp.remove();
        unsubscribeLinking.remove();
      };
    }
  }, [initialized]);

  const onStateChange = useCallback(() => {
    Sentry.addBreadcrumb({
      category: 'navigation',
      message: navigator.getCurrentRoute()?.name,
      level: 'info',
    });
  }, []);

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
            <NavigationContainer
              ref={navigator}
              theme={navTheme}
              onStateChange={onStateChange}>
              <Stack.Navigator screenOptions={basicScreenOptions} key={theme}>
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
                  <Stack.Screen
                    name="proposalDeposit"
                    component={ProposalDepositScreen}
                  />
                </Stack.Group>
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
                    options={withoutHeader}
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
                    name="settingsProviders"
                    component={SettingsProvidersScreen}
                    options={withoutHeader}
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
                      title: getText(I18N.settingsSecurity),
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
                    options={withoutHeader}
                  />
                  <Stack.Screen
                    name="settingsContactEdit"
                    component={SettingsContactEditScreen}
                    options={withoutHeader}
                  />

                  <Stack.Screen
                    name="settingsProviderForm"
                    component={SettingsProviderEditScreen}
                    options={withoutHeader}
                  />
                  <Stack.Screen
                    name="settingsTheme"
                    component={SettingsThemeScreen}
                    options={{
                      title: getText(I18N.settingsThemeScreen),
                    }}
                  />
                  <Stack.Screen
                    name="settingsViewRecoveryPhrase"
                    options={{
                      title: getText(I18N.settingsViewRecoveryPhraseTitle),
                    }}
                    component={SettingsViewRecoveryPhraseScreen}
                  />
                  <Stack.Screen
                    name="settingsSecurity"
                    options={{
                      title: getText(I18N.settingsSecurity),
                    }}
                    component={SettingsSecurityScreen}
                  />
                </Stack.Group>
                <Stack.Group screenOptions={screenOptions}>
                  <Stack.Screen
                    name="stakingValidators"
                    component={StakingValidatorsScreen}
                    options={withoutHeader}
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
          </WalletsContext.Provider>
        </TransactionsContext.Provider>
      </AppContext.Provider>
    </SafeAreaProvider>
  );
};
