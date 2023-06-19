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

import {ADJUST_ENVIRONMENT, ADJUST_TOKEN} from '@env';
import {ActionSheetProvider} from '@expo/react-native-action-sheet';
import NetInfo, {NetInfoState} from '@react-native-community/netinfo';
import {
  DefaultTheme,
  NavigationContainer,
  Theme,
} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import * as Sentry from '@sentry/react-native';
import {AppState, Linking, Platform, StyleSheet} from 'react-native';
import {Adjust, AdjustConfig} from 'react-native-adjust';
import {AdjustOaid} from 'react-native-adjust-oaid';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import SplashScreen from 'react-native-splash-screen';

import {Color, getColor} from '@app/colors';
import {PopupHeader} from '@app/components';
import {app} from '@app/contexts';
import {Events} from '@app/events';
import {
  captureException,
  createTheme,
  hideModal,
  showModal,
} from '@app/helpers';
import {awaitForEventDone} from '@app/helpers/await-for-event-done';
import {getNewsDetailAppTitle} from '@app/helpers/get-news-detail-title';
import {getWalletTitle} from '@app/helpers/get-wallet-title';
import {trackEvent} from '@app/helpers/track-event';
import {useTheme, useUser} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {navigator} from '@app/navigator';
import {AccountInfoScreen} from '@app/screens/account-info';
import {GovernanceScreen} from '@app/screens/governance';
import {NewsScreen} from '@app/screens/news';
import {NewsDetailScreen} from '@app/screens/news-detail';
import {BackupSssNotificationScreen} from '@app/screens/popup-backup-sss-notification';
import {BackupSssSuggestionScreen} from '@app/screens/popup-backup-sss-suggestion';
import {PopupNotificationNewsScreen} from '@app/screens/popup-notification-news';
import {ProposalScreen} from '@app/screens/proposal';
import {SettingsNotificationScreen} from '@app/screens/settings-notification-screen';
import {StakingDelegateScreen} from '@app/screens/staking-delegate';
import {StakingInfoScreen} from '@app/screens/staking-info';
import {StakingUnDelegateScreen} from '@app/screens/staking-undelegate';
import {StakingValidatorsScreen} from '@app/screens/staking-validators';
import {
  ActionSheetType,
  AppTheme,
  PresentationNavigation,
  RootStackParamList,
  ScreenOptionType,
  StackPresentationTypes,
} from '@app/types';
import {sleep} from '@app/utils';

import {StatusBarColor} from './components/ui';
import {migrationWallets} from './models/migration-wallets';
import {BackupScreen} from './screens/backup';
import {CreateScreen} from './screens/create';
import {HomeScreen} from './screens/home';
import {HomeStakingScreen} from './screens/home-staking';
import {JsonRpcSignPopup} from './screens/json-rpc-sign-popup';
import {LedgerScreen} from './screens/ledger';
import {ModalsScreen} from './screens/modals-screen';
import {NftDetailsScreen} from './screens/nft-details';
import {BackupNotificationScreen} from './screens/popup-backup-notification';
import {PopupNotificationScreen} from './screens/popup-notification';
import {PopupTrackActivityScreen} from './screens/popup-track-activity';
import {ProposalDepositScreen} from './screens/proposal-deposit';
import {RaffleDetailsScreen} from './screens/raffle-details';
import {RaffleRewardScreen} from './screens/raffle-reward';
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
import {SssMigrateScreen} from './screens/sss-migrate';
import {TransactionScreen} from './screens/transaction';
import {TransactionDetailScreen} from './screens/transaction-detail';
import {WalletConnectScreen} from './screens/wallet-connect';
import {WalletConnectApplicationDetailsScreen} from './screens/wallet-connect-application-details';
import {WalletConnectApplicationDetailsPopupScreen} from './screens/wallet-connect-application-details-popup';
import {WalletConnectApplicationListScreen} from './screens/wallet-connect-application-list';
import {WalletConnectApplicationListPopupScreen} from './screens/wallet-connect-application-list-popup';
import {WalletConnectWalletListScreen} from './screens/wallet-connect-wallet-list';
import {WalletProtectionPopup} from './screens/wallet-protection-popup';
import {WalletSelectorScreen} from './screens/wallet-selector-screen';
import {Web3BrowserPopup} from './screens/web3-browser-popup';
import {WelcomeScreen} from './screens/welcome';
import {RemoteConfig} from './services/remote-config';

const screenOptions: ScreenOptionType = {
  tab: Platform.select({ios: true, android: false}),
  gestureEnabled: false,
  headerBackVisible: true,
  headerShown: true,
  header: PopupHeader,
  headerStyle: {
    height: 56,
  },
};

const Stack = createStackNavigator<RootStackParamList>();

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
  const user = useUser();

  const navTheme = useMemo(
    () => ({dark: theme === AppTheme.dark, colors: appTheme.colors} as Theme),
    [theme],
  );

  useEffect(() => {
    showModal('splash');

    sleep(150)
      .then(() => SplashScreen.hide())
      .then(() => RemoteConfig.init())
      .then(async () => {
        if (app.getUser().onboarded) {
          await app.init();
          await migrationWallets();
          await awaitForEventDone(Events.onAppLoggedId);
        }
      })
      .catch(async e => {
        captureException(e, 'app init');
      })
      .finally(async () => {
        await awaitForEventDone(Events.onAppStarted);
        hideModal('splash');
        setInitialized(true);
      });
  }, []);

  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (initialized) {
      const subscription = ({isConnected}: NetInfoState) => {
        isConnected ? hideModal('noInternet') : showModal('noInternet');
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

  useEffect(() => {
    const adjustConfig = new AdjustConfig(ADJUST_TOKEN, ADJUST_ENVIRONMENT);
    adjustConfig.setLogLevel(AdjustConfig.LogLevelVerbose);
    if (Platform.OS === 'android') {
      AdjustOaid.readOaid();
    }

    Adjust.create(adjustConfig);

    Adjust.getAppTrackingAuthorizationStatus(function (status) {
      console.log('Authorization status = ' + status);
    });

    Adjust.getAdid(adid => {
      console.log('Adid = ' + adid);
    });

    adjustConfig.setAttributionCallbackListener(function (attribution) {
      console.log('Attribution callback received');
      console.log('Tracker token = ' + attribution.trackerToken);
      console.log('Tracker name = ' + attribution.trackerName);
      console.log('Network = ' + attribution.network);
      console.log('Campaign = ' + attribution.campaign);
      console.log('Adgroup = ' + attribution.adgroup);
      console.log('Creative = ' + attribution.creative);
      console.log('Click label = ' + attribution.clickLabel);
      console.log('Adid = ' + attribution.adid);
      console.log('Cost type = ' + attribution.costType);
      console.log('Cost amount = ' + attribution.costAmount);
      console.log('Cost currency = ' + attribution.costCurrency);
    });

    adjustConfig.setEventTrackingSucceededCallbackListener(function (
      eventSuccess,
    ) {
      console.log('Event tracking succeeded callback received');
      console.log('Message: ' + eventSuccess.message);
      console.log('Timestamp: ' + eventSuccess.timestamp);
      console.log('Adid: ' + eventSuccess.adid);
      console.log('Event token: ' + eventSuccess.eventToken);
      console.log('Callback Id: ' + eventSuccess.callbackId);
      console.log('JSON response: ' + eventSuccess.jsonResponse);
    });

    adjustConfig.setEventTrackingFailedCallbackListener(function (eventFailed) {
      console.log('Event tracking failed callback received');
      console.log('Message: ' + eventFailed.message);
      console.log('Timestamp: ' + eventFailed.timestamp);
      console.log('Adid: ' + eventFailed.adid);
      console.log('Event token: ' + eventFailed.eventToken);
      console.log('Callback Id: ' + eventFailed.callbackId);
      console.log('Will retry: ' + eventFailed.willRetry);
      console.log('JSON response: ' + eventFailed.jsonResponse);
    });

    return () => {
      Adjust.componentWillUnmount();
    };
  }, []);

  const onStateChange = useCallback(async () => {
    Sentry.addBreadcrumb({
      category: 'navigation',
      message: navigator.getCurrentRoute()?.name,
      level: 'info',
    });

    await trackEvent('navigation', {
      path: navigator.getCurrentRoute()?.name,
    });
  }, []);

  // @ts-ignore
  return (
    <GestureHandlerRootView style={styles.rootView}>
      <ActionSheetProvider>
        <SafeAreaProvider>
          <StatusBarColor
            barStyle={
              theme === AppTheme.dark ? 'light-content' : 'dark-content'
            }
            backgroundColor={getColor(Color.bg1)}
          />
          <NavigationContainer
            ref={navigator}
            theme={navTheme}
            onStateChange={onStateChange}>
            <Stack.Navigator
              screenOptions={basicScreenOptions}
              key={theme}
              initialRouteName={user.onboarded ? 'home' : 'welcome'}>
              <Stack.Screen name="home" component={HomeScreen} />
              <Stack.Screen name="welcome" component={WelcomeScreen} />
              {/* Modals group */}
              <Stack.Group screenOptions={stackScreenOptions}>
                <Stack.Screen
                  name="web3BrowserPopup"
                  component={Web3BrowserPopup}
                />
                <Stack.Screen name="sssMigrate" component={SssMigrateScreen} />
                <Stack.Screen name="jsonRpcSign" component={JsonRpcSignPopup} />
                <Stack.Screen name="nftDetails" component={NftDetailsScreen} />
                <Stack.Screen name="backup" component={BackupScreen} />
                <Stack.Screen name="signin" component={SignInScreen} />
                <Stack.Screen name="signup" component={SignUpScreen} />
                <Stack.Screen
                  name="transaction"
                  component={TransactionScreen}
                />
                <Stack.Screen
                  name="walletConnect"
                  component={WalletConnectScreen}
                />
                <Stack.Screen
                  name="walletConnectApplicationListPopup"
                  component={WalletConnectApplicationListPopupScreen}
                />
                <Stack.Screen
                  name="walletProtectionPopup"
                  component={WalletProtectionPopup}
                />
                <Stack.Screen
                  name="walletConnectApplicationDetailsPopup"
                  component={WalletConnectApplicationDetailsPopupScreen}
                />
                <Stack.Screen
                  name="walletSelector"
                  component={WalletSelectorScreen}
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
                name="accountInfo"
                component={AccountInfoScreen}
                options={getWalletTitle}
              />
              <Stack.Screen
                name="backupNotification"
                component={BackupNotificationScreen}
                options={actionsSheet}
              />
              <Stack.Screen
                name="backupSssNotification"
                component={BackupSssNotificationScreen}
                options={actionsSheet}
              />
              <Stack.Screen
                name="backupSssSuggestion"
                component={BackupSssSuggestionScreen}
                options={actionsSheet}
              />
              <Stack.Screen
                name="popupNotification"
                component={PopupNotificationScreen}
                options={actionsSheet}
              />
              <Stack.Screen
                name="popupNotificationNews"
                component={PopupNotificationNewsScreen}
                options={actionsSheet}
              />
              <Stack.Screen
                name="popupTrackActivity"
                component={PopupTrackActivityScreen}
                options={actionsSheet}
              />
              <Stack.Screen
                name="transactionDetail"
                component={TransactionDetailScreen}
                options={actionsSheet}
              />
              <Stack.Screen name="news" component={NewsScreen} />
              <Stack.Screen
                name="governance"
                component={GovernanceScreen}
                options={{
                  title: getText(I18N.homeGovernanceTitle),
                }}
              />
              <Stack.Screen
                name="newsDetail"
                component={NewsDetailScreen}
                options={getNewsDetailAppTitle}
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
                  name="raffleDetails"
                  component={RaffleDetailsScreen}
                />
                <Stack.Screen
                  name="raffleReward"
                  component={RaffleRewardScreen}
                  options={withoutHeader}
                />
                <Stack.Screen name="staking" component={HomeStakingScreen} />
                <Stack.Screen
                  name="settingsAccountDetail"
                  component={SettingsAccountDetailScreen}
                  options={withoutHeader}
                />
                <Stack.Screen
                  name="walletConnectWalletList"
                  component={WalletConnectWalletListScreen}
                  options={{
                    title: getText(I18N.walletConnectWalletListTitle),
                  }}
                />
                <Stack.Screen
                  name="walletConnectApplicationList"
                  component={WalletConnectApplicationListScreen}
                />
                <Stack.Screen
                  name="walletConnectApplicationDetails"
                  component={WalletConnectApplicationDetailsScreen}
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
                  name="settingsNotification"
                  component={SettingsNotificationScreen}
                  options={{
                    title: getText(I18N.settingsNotification),
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
          <ModalsScreen initialModal={{type: 'splash'}} />
        </SafeAreaProvider>
      </ActionSheetProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  rootView: {
    flex: 1,
  },
});
