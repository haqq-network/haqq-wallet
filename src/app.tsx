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
  NavigationAction,
  NavigationContainer,
  Theme,
} from '@react-navigation/native';
import {TransitionPresets, createStackNavigator} from '@react-navigation/stack';
import * as Sentry from '@sentry/react-native';
import {AppState, Linking, Platform, StatusBar, StyleSheet} from 'react-native';
import {Adjust, AdjustConfig} from 'react-native-adjust';
import {AdjustOaid} from 'react-native-adjust-oaid';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import SplashScreen from 'react-native-splash-screen';

import {Color} from '@app/colors';
import {PopupHeader} from '@app/components';
import {app} from '@app/contexts';
import {Events} from '@app/events';
import {createTheme, hideModal, showModal} from '@app/helpers';
import {awaitForEventDone} from '@app/helpers/await-for-event-done';
import {getNewsDetailAppTitle} from '@app/helpers/get-news-detail-title';
import {getWalletTitle} from '@app/helpers/get-wallet-title';
import {trackEvent} from '@app/helpers/track-event';
import {useTheme} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {navigator} from '@app/navigator';
import {AccountDetailScreen} from '@app/screens/account-detail';
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
import {WelcomeNewsScreen} from '@app/screens/welcome-news';
import {
  ActionSheetType,
  AppTheme,
  PresentationNavigation,
  RootStackParamList,
  ScreenOptionType,
  StackPresentationTypes,
} from '@app/types';
import {getAppTrackingAuthorizationStatus, sleep} from '@app/utils';

import {Spacer} from './components/ui';
import {getModalScreenOptions} from './helpers/get-modal-screen-options';
import {themeUpdaterHOC} from './helpers/theme-updater-hoc';
import {migrationWallets} from './models/migration-wallets';
import {BackupScreen} from './screens/backup';
import {CreateScreen} from './screens/create';
import {HomeScreen} from './screens/home';
import {HomeStakingScreen} from './screens/home-staking';
import {InAppBrowserScreen} from './screens/in-app-browser';
import {JsonRpcSignPopup} from './screens/json-rpc-sign-popup';
import {LedgerScreen} from './screens/ledger';
import {ModalsScreen} from './screens/modals-screen';
import {NftDetailsScreen} from './screens/nft-details';
import {OurNewsScreen} from './screens/our-news';
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
import {TotalValueInfoScreen} from './screens/total-value-info';
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
  animation: undefined,
  animationDuration: 0,
  animationEnabled: false,
};

const fullScreenModalOptions: ScreenOptionType = {
  keyboardHandlingEnabled: false,
  headerBackHidden: true,
  headerShown: true,
  gestureEnabled: false,
  header: () => <Spacer height={StatusBar.currentHeight} />,
  headerBackground: () => <Spacer height={StatusBar.currentHeight} />,
  ...TransitionPresets.ModalSlideFromBottomIOS,
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

const totalValueInfoOptions = getModalScreenOptions(I18N.totalValueScreenTitle);

export const App = () => {
  const theme = useTheme();

  const navTheme = useMemo(
    () => ({dark: theme === AppTheme.dark, colors: appTheme.colors}) as Theme,
    [theme],
  );

  useEffect(() => {
    sleep(150)
      .then(() => SplashScreen.hide())
      .then(() => awaitForEventDone(Events.onAppInitialized))
      .then(async () => {
        if (app.onboarded) {
          await app.init();
          await migrationWallets();
        }
      })
      .then(() => hideModal('splash'))
      .then(() => awaitForEventDone(Events.onAppLoggedId))
      .catch(async e => {
        Logger.captureException(e, 'app init');
      })
      .finally(async () => {
        await awaitForEventDone(Events.onAppStarted);
        hideModal('splash');
        setInitialized(true);
      });
  }, []);

  const [initialized, setInitialized] = useState(false);
  const [isPinReseted, setPinReseted] = useState(false);

  useEffect(() => {
    if (initialized) {
      const subscription = ({isConnected}: NetInfoState) => {
        isConnected ? hideModal('noInternet') : showModal('noInternet');
      };

      const linkingSubscription = ({url}: {url: string}) => {
        if (url) {
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
    if (app.isDeveloper) {
      getAppTrackingAuthorizationStatus().then(status => {
        Logger.log('Authorization status = ' + status);
      });

      Adjust.getAdid(adid => {
        Logger.log('Adid = ' + adid);
      });
    }
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

  const initialRoute = useMemo(() => {
    if (app.onboarded && !isPinReseted) {
      return 'home';
    }

    if (app.isWelcomeNewsEnabled) {
      return 'welcomeNews';
    }

    return 'welcome';
  }, [isPinReseted]);

  const onUnhandledAction = useCallback((action: NavigationAction) => {
    if (action.type === 'reset-pin') {
      setPinReseted(true);
    }
  }, []);

  // @ts-ignore
  return (
    <GestureHandlerRootView style={styles.rootView}>
      <ActionSheetProvider>
        <SafeAreaProvider>
          <NavigationContainer
            key={initialRoute}
            onUnhandledAction={onUnhandledAction}
            ref={navigator}
            theme={navTheme}
            onStateChange={onStateChange}>
            <Stack.Navigator
              screenOptions={basicScreenOptions}
              initialRouteName={initialRoute}>
              <Stack.Screen
                name="home"
                component={themeUpdaterHOC(HomeScreen)}
              />
              <Stack.Screen
                name="welcome"
                component={themeUpdaterHOC(WelcomeScreen)}
              />
              <Stack.Screen
                name="welcomeNews"
                component={themeUpdaterHOC(WelcomeNewsScreen)}
              />
              <Stack.Screen
                name="inAppBrowser"
                component={themeUpdaterHOC(InAppBrowserScreen)}
                options={fullScreenModalOptions}
              />
              {/* Modals group */}
              <Stack.Group screenOptions={stackScreenOptions}>
                <Stack.Screen
                  name="web3BrowserPopup"
                  component={themeUpdaterHOC(Web3BrowserPopup)}
                />
                <Stack.Screen
                  name="sssMigrate"
                  component={themeUpdaterHOC(SssMigrateScreen)}
                />
                <Stack.Screen
                  name="jsonRpcSign"
                  component={themeUpdaterHOC(JsonRpcSignPopup)}
                />
                <Stack.Screen
                  name="nftDetails"
                  component={themeUpdaterHOC(NftDetailsScreen)}
                />
                <Stack.Screen
                  name="backup"
                  component={themeUpdaterHOC(BackupScreen)}
                />
                <Stack.Screen
                  name="signin"
                  component={themeUpdaterHOC(SignInScreen)}
                />
                <Stack.Screen
                  name="signup"
                  component={themeUpdaterHOC(SignUpScreen)}
                />
                <Stack.Screen
                  name="transaction"
                  component={themeUpdaterHOC(TransactionScreen)}
                />
                <Stack.Screen
                  name="walletConnect"
                  component={themeUpdaterHOC(WalletConnectScreen)}
                />
                <Stack.Screen
                  name="walletConnectApplicationListPopup"
                  component={themeUpdaterHOC(
                    WalletConnectApplicationListPopupScreen,
                  )}
                />
                <Stack.Screen
                  name="walletProtectionPopup"
                  component={themeUpdaterHOC(WalletProtectionPopup)}
                />
                <Stack.Screen
                  name="walletConnectApplicationDetailsPopup"
                  component={themeUpdaterHOC(
                    WalletConnectApplicationDetailsPopupScreen,
                  )}
                />
                <Stack.Screen
                  name="walletSelector"
                  component={themeUpdaterHOC(WalletSelectorScreen)}
                />
                <Stack.Screen
                  name="restore"
                  component={themeUpdaterHOC(RestoreScreen)}
                />
                <Stack.Screen
                  name="create"
                  component={themeUpdaterHOC(CreateScreen)}
                />
                <Stack.Screen
                  name="ledger"
                  component={themeUpdaterHOC(LedgerScreen)}
                />
                <Stack.Screen
                  name="stakingDelegate"
                  component={themeUpdaterHOC(StakingDelegateScreen)}
                />
                <Stack.Screen
                  name="stakingUnDelegate"
                  component={themeUpdaterHOC(StakingUnDelegateScreen)}
                />
                <Stack.Screen
                  name="proposalDeposit"
                  component={themeUpdaterHOC(ProposalDepositScreen)}
                />
              </Stack.Group>
              <Stack.Screen
                name="accountInfo"
                component={themeUpdaterHOC(AccountInfoScreen)}
                options={getWalletTitle}
              />
              <Stack.Screen
                name="totalValueInfo"
                component={themeUpdaterHOC(TotalValueInfoScreen)}
                options={totalValueInfoOptions}
              />
              <Stack.Screen
                name="backupNotification"
                component={themeUpdaterHOC(BackupNotificationScreen)}
                options={actionsSheet}
              />
              <Stack.Screen
                name="backupSssNotification"
                component={themeUpdaterHOC(BackupSssNotificationScreen)}
                options={actionsSheet}
              />
              <Stack.Screen
                name="backupSssSuggestion"
                component={themeUpdaterHOC(BackupSssSuggestionScreen)}
                options={actionsSheet}
              />
              <Stack.Screen
                name="popupNotification"
                component={themeUpdaterHOC(PopupNotificationScreen)}
                options={actionsSheet}
              />
              <Stack.Screen
                name="popupNotificationNews"
                component={themeUpdaterHOC(PopupNotificationNewsScreen)}
                options={actionsSheet}
              />
              <Stack.Screen
                name="popupTrackActivity"
                component={themeUpdaterHOC(PopupTrackActivityScreen)}
                options={actionsSheet}
              />
              <Stack.Screen
                name="transactionDetail"
                component={themeUpdaterHOC(TransactionDetailScreen)}
                options={actionsSheet}
              />
              <Stack.Screen
                name="accountDetail"
                component={themeUpdaterHOC(AccountDetailScreen)}
                options={actionsSheet}
              />
              <Stack.Screen
                name="news"
                component={themeUpdaterHOC(NewsScreen)}
              />
              <Stack.Screen
                name="governance"
                component={themeUpdaterHOC(GovernanceScreen)}
                options={{
                  title: getText(I18N.homeGovernanceTitle),
                }}
              />
              <Stack.Screen
                name="newsDetail"
                component={themeUpdaterHOC(NewsDetailScreen)}
                options={getNewsDetailAppTitle}
              />
              <Stack.Group screenOptions={screenOptions}>
                <Stack.Screen
                  name="settingsAccounts"
                  component={themeUpdaterHOC(SettingsAccountsScreen)}
                  options={{
                    title: 'Manage accounts',
                  }}
                />
                <Stack.Screen
                  name="ourNews"
                  component={themeUpdaterHOC(OurNewsScreen)}
                  options={{
                    title: getText(I18N.ourNewsTitle),
                  }}
                />
                <Stack.Screen
                  name="raffleDetails"
                  component={themeUpdaterHOC(RaffleDetailsScreen)}
                />
                <Stack.Screen
                  name="raffleReward"
                  component={themeUpdaterHOC(RaffleRewardScreen)}
                  options={withoutHeader}
                />
                <Stack.Screen
                  name="staking"
                  component={themeUpdaterHOC(HomeStakingScreen)}
                />
                <Stack.Screen
                  name="settingsAccountDetail"
                  component={themeUpdaterHOC(SettingsAccountDetailScreen)}
                  options={withoutHeader}
                />
                <Stack.Screen
                  name="walletConnectWalletList"
                  component={themeUpdaterHOC(WalletConnectWalletListScreen)}
                  options={{
                    title: getText(I18N.walletConnectWalletListTitle),
                  }}
                />
                <Stack.Screen
                  name="walletConnectApplicationList"
                  component={themeUpdaterHOC(
                    WalletConnectApplicationListScreen,
                  )}
                />
                <Stack.Screen
                  name="walletConnectApplicationDetails"
                  component={themeUpdaterHOC(
                    WalletConnectApplicationDetailsScreen,
                  )}
                />
                <Stack.Screen
                  name="settingsAccountStyle"
                  component={themeUpdaterHOC(SettingsAccountStyleScreen)}
                  options={{
                    title: 'Change style',
                  }}
                />
                <Stack.Screen
                  name="settingsAddressBook"
                  component={themeUpdaterHOC(SettingsAddressBookScreen)}
                  options={{
                    title: 'Address book',
                  }}
                />
                <Stack.Screen
                  name="settingsLanguage"
                  component={themeUpdaterHOC(SettingsLanguageScreen)}
                  options={{
                    title: 'Language',
                  }}
                />
                <Stack.Screen
                  name="settingsProviders"
                  component={themeUpdaterHOC(SettingsProvidersScreen)}
                  options={withoutHeader}
                />
                <Stack.Screen
                  name="settingsSecurityPin"
                  component={themeUpdaterHOC(SettingsSecurityPinScreen)}
                  options={{
                    title: 'Change PIN',
                  }}
                />
                <Stack.Screen
                  name="settingsNotification"
                  component={themeUpdaterHOC(SettingsNotificationScreen)}
                  options={{
                    title: getText(I18N.settingsNotification),
                  }}
                />
                <Stack.Screen
                  name="settingsFaq"
                  component={themeUpdaterHOC(SettingsFAQScreen)}
                  options={{
                    title: getText(I18N.settingsSecurity),
                  }}
                />
                <Stack.Screen
                  name="settingsAbout"
                  component={themeUpdaterHOC(SettingsAboutScreen)}
                  options={{
                    title: 'About',
                  }}
                />
                <Stack.Screen
                  name="settingsTest"
                  component={themeUpdaterHOC(SettingsTestScreen)}
                  options={{
                    title: 'Test',
                  }}
                />
                <Stack.Screen
                  name="settingsAccountEdit"
                  component={themeUpdaterHOC(SettingsAccountEditScreen)}
                  options={withoutHeader}
                />
                <Stack.Screen
                  name="settingsContactEdit"
                  component={themeUpdaterHOC(SettingsContactEditScreen)}
                  options={withoutHeader}
                />

                <Stack.Screen
                  name="settingsProviderForm"
                  component={themeUpdaterHOC(SettingsProviderEditScreen)}
                  options={withoutHeader}
                />
                <Stack.Screen
                  name="settingsTheme"
                  component={themeUpdaterHOC(SettingsThemeScreen)}
                  options={{
                    title: getText(I18N.settingsThemeScreen),
                  }}
                />
                <Stack.Screen
                  name="settingsViewRecoveryPhrase"
                  options={{
                    title: getText(I18N.settingsViewRecoveryPhraseTitle),
                  }}
                  component={themeUpdaterHOC(SettingsViewRecoveryPhraseScreen)}
                />
                <Stack.Screen
                  name="settingsSecurity"
                  options={{
                    title: getText(I18N.settingsSecurity),
                  }}
                  component={themeUpdaterHOC(SettingsSecurityScreen)}
                />
              </Stack.Group>
              <Stack.Group screenOptions={screenOptions}>
                <Stack.Screen
                  name="stakingValidators"
                  component={themeUpdaterHOC(StakingValidatorsScreen)}
                  options={withoutHeader}
                />
                <Stack.Screen
                  name="stakingInfo"
                  component={themeUpdaterHOC(StakingInfoScreen)}
                  options={{
                    title: getText(I18N.stakingInfo),
                  }}
                />
              </Stack.Group>
              <Stack.Group screenOptions={screenOptions}>
                <Stack.Screen
                  name="proposal"
                  component={themeUpdaterHOC(ProposalScreen)}
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
