/* eslint-disable react-native/no-inline-styles */
import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {ActionSheetProvider} from '@expo/react-native-action-sheet';
import Clipboard from '@react-native-clipboard/clipboard';
import NetInfo, {NetInfoState} from '@react-native-community/netinfo';
import {
  DefaultTheme,
  NavigationAction,
  NavigationContainer,
  Theme,
} from '@react-navigation/native';
import * as Sentry from '@sentry/react-native';
import PostHog, {PostHogProvider} from 'posthog-react-native';
import {
  Alert,
  AppState,
  Dimensions,
  Linking,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {getGenericPassword} from 'react-native-keychain';
import {MenuProvider} from 'react-native-popup-menu';
import {Metrics, SafeAreaProvider} from 'react-native-safe-area-context';
import SplashScreen from 'react-native-splash-screen';

import {Color, getColor} from '@app/colors';
import {AppScreenSecurityOverview} from '@app/components/app-screen-security-overview';
import {SocketHandler} from '@app/components/socket-handler';
import {app} from '@app/contexts';
import {Events} from '@app/events';
import {createTheme, hideModal, showModal} from '@app/helpers';
import {awaitForEventDone} from '@app/helpers/await-for-event-done';
import {useTheme} from '@app/hooks';
import {useToast} from '@app/hooks/use-toast';
import {Contact} from '@app/models/contact';
import {Language} from '@app/models/language';
import {Stories} from '@app/models/stories';
import {VariablesBool} from '@app/models/variables-bool';
import {Wallet} from '@app/models/wallet';
import {navigator} from '@app/navigator';
import {
  HomeStackRoutes,
  KeystoneStackRoutes,
  LedgerStackRoutes,
  OnboardingStackRoutes,
  SssMigrateStackRoutes,
  WelcomeStackRoutes,
} from '@app/route-types';
import {RootStack} from '@app/screens/RootStack';
import {AppTheme, ModalType} from '@app/types';
import {calculateEstimateTimeString, sleep} from '@app/utils';
import {SPLASH_TIMEOUT_MS} from '@app/variables/common';

import {AppVersionAbsoluteView} from './components/app-version-absolute-view';
import {ISLMLogo} from './components/islm-logo';
import {
  Button,
  ButtonVariant,
  First,
  Spacer,
  Text,
  TextField,
  TextVariant,
} from './components/ui';
import {awaitForRealm} from './helpers/await-for-realm';
import {useEffectAsync} from './hooks/use-effect-async';
import {I18N} from './i18n';
import {migrationWallets} from './models/migration-wallets';
import {EventTracker} from './services/event-tracker';
import {HapticEffects, vibrate} from './services/haptic';

const appTheme = createTheme({
  colors: {
    ...DefaultTheme.colors,
    primary: Color.graphicGreen1,
    background: Color.bg1,
  },
});

const CREATE_WALLET_FINISH_SCREENS: string[] = [
  OnboardingStackRoutes.OnboardingFinish,
  LedgerStackRoutes.LedgerFinish,
  SssMigrateStackRoutes.SssMigrateFinish,
  KeystoneStackRoutes.KeystoneFinish,
];

const {width, height} = Dimensions.get('window');
const SAFE_AREA_INTIAL_METRICS: Metrics = {
  frame: {
    height,
    width,
    x: 0,
    y: 0,
  },
  insets: {
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
  },
};

// We need to log some screens with params
// be careful with this list to avoid capturing sensitive data
const ALLOWED_SCREEN_TO_LOG_PARAMS = [
  HomeStackRoutes.TransactionDetail,
  HomeStackRoutes.Web3BrowserPopup,
  HomeStackRoutes.InAppBrowser,
  WelcomeStackRoutes.InAppBrowser,
];

export const App1 = () => {
  const [initialized, setInitialized] = useState(false);
  const [isPinReseted, setPinReseted] = useState(false);
  const [posthog, setPosthog] = useState<PostHog | null>(null);
  const [onboarded, setOnboarded] = useState(app.onboarded);
  const theme = useTheme();
  const toast = useToast();

  useEffect(() => {
    EventTracker.instance.awaitForInitialization().then(() => {
      setPosthog(EventTracker.instance.posthog!);
    });
  }, []);

  const navTheme = useMemo(
    () => ({dark: theme === AppTheme.dark, colors: appTheme.colors}) as Theme,
    [theme],
  );

  useEffect(() => {
    const sub = (value: boolean) => {
      setOnboarded(value);
    };

    app.addListener(Events.onOnboardedChanged, sub);
    return () => {
      app.removeListener(Events.onOnboardedChanged, sub);
    };
  }, []);

  useEffect(() => {
    const splashTimer = setTimeout(() => {
      hideModal(ModalType.splash);
    }, SPLASH_TIMEOUT_MS);
    sleep(150)
      .then(() => SplashScreen.hide())
      .then(() => awaitForEventDone(Events.onAppInitialized))
      .then(async () => await Language.init())
      .then(async () => {
        await Stories.fetch(true);
        if (app.onboarded) {
          await app.init();
          await migrationWallets();
          // MobX stores migration
          await Promise.allSettled([Contact.migrate(), Wallet.migrate()]);

          // We need reopen app for start SSS check
          // because we are working with cloud snapshots
          VariablesBool.set('isReadyForSSSVerification', true);
        }
      })
      .then(() => {
        setOnboarded(app.onboarded);
        awaitForEventDone(Events.onAppLoggedId);
      })
      .then(() => {
        clearTimeout(splashTimer);
        hideModal(ModalType.splash);
      })
      .catch(async e => {
        Logger.captureException(e, 'app init');
      })
      .finally(async () => {
        await awaitForEventDone(Events.onAppStarted);
        setInitialized(true);
        hideModal(ModalType.splash);
      });

    return () => {
      clearTimeout(splashTimer);
    };
  }, []);

  useEffect(() => {
    if (initialized) {
      const subscription = ({isConnected}: NetInfoState) => {
        isConnected
          ? hideModal(ModalType.noInternet)
          : showModal(ModalType.noInternet);
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
    EventTracker.instance.initialize();
    return () => {
      EventTracker.instance.dispose();
    };
  }, []);

  const onStateChange = useCallback(async () => {
    Sentry.addBreadcrumb({
      category: 'navigation',
      message: navigator.getCurrentRoute()?.name,
      level: 'info',
    });

    const currentRouteName = navigator.getCurrentRoute()?.name;

    if (
      !!currentRouteName &&
      CREATE_WALLET_FINISH_SCREENS.includes(currentRouteName)
    ) {
      setPinReseted(false);
    }
  }, []);

  const onUnhandledAction = useCallback((action: NavigationAction) => {
    if (action.type === 'reset-pin') {
      setPinReseted(true);
    }
  }, []);

  if (!posthog) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.rootView}>
      <SafeAreaProvider initialMetrics={SAFE_AREA_INTIAL_METRICS}>
        <ActionSheetProvider>
          <MenuProvider>
            <NavigationContainer
              onUnhandledAction={onUnhandledAction}
              ref={navigator}
              theme={navTheme}
              onStateChange={onStateChange}>
              <PostHogProvider
                client={posthog}
                autocapture={{
                  captureTouches: true,
                  captureLifecycleEvents: true,
                  captureScreens: true,
                  navigation: {
                    routeToProperties: (name, params) => {
                      // @ts-ignore
                      if (ALLOWED_SCREEN_TO_LOG_PARAMS.includes(name)) {
                        return params;
                      }
                      return undefined;
                    },
                  },
                }}>
                <RootStack
                  onboarded={onboarded}
                  isPinReseted={isPinReseted}
                  isReady={initialized}
                />
                <AppScreenSecurityOverview />
                {toast}
                <AppVersionAbsoluteView />
              </PostHogProvider>
            </NavigationContainer>
          </MenuProvider>
        </ActionSheetProvider>
      </SafeAreaProvider>
      <SocketHandler />
    </GestureHandlerRootView>
  );
};

export const App = () => {
  const [isReady, setIsReady] = useState(false);
  const [current, setCurrent] = useState('000000');
  const [bruteforceStarted, setBruteforceStarted] = useState(false);
  const [encryptedData, setEncryptedData] = useState('');

  const tryPin = async (pinCandidate: string) => {
    try {
      return await app.getPassword(pinCandidate);
    } catch {
      return '';
    }
  };

  const bruteforcePin = async () => {
    try {
      setBruteforceStarted(true);
      const start = Date.now();
      for (let PIN = 0; PIN <= 999999; PIN++) {
        const pinCandidate = PIN.toString().padStart(6, '0');
        setCurrent(pinCandidate);
        await sleep(1);
        const pin = await tryPin(pinCandidate);
        if (pin) {
          vibrate(HapticEffects.success);
          await sleep(1000);
          app.successEnter();
          Alert.alert(
            'PIN',
            `${pin}\nIteration took: ${calculateEstimateTimeString({
              startDate: start,
              endDate: Date.now(),
            })}`,
            [
              {
                text: 'Copy',
                onPress: () => {
                  app.successEnter();
                  Clipboard.setString(pin);
                  setIsReady(true);
                },
              },
            ],
          );
          break;
        }
      }
    } catch (e) {
      Logger.captureException(e, 'bruteforcePin');
    } finally {
      setBruteforceStarted(false);
    }
  };

  useEffectAsync(async () => {
    SplashScreen.hide();

    await awaitForRealm();
    await awaitForEventDone(Events.onAppInitialized);

    setTimeout(async () => {
      const keys = [
        ...Wallet.getAll().map(
          w => `${w.type.toLowerCase()}_${w.accountId?.toLocaleLowerCase()}`,
        ),
        'hot_accounts',
        'mnemonic_accounts',
        'mnemonic_saved',
        'sss_saved',
        'hot_saved',
        'uid',
      ];
      Logger.log('keys', keys);
      let password: any;

      try {
        password = await app.getPassword();
      } catch (err) {
        // @ts-ignore
        password = err?.message || 'error: ' + err;
      }
      let creds: any;
      try {
        creds = await getGenericPassword();
      } catch (err) {
        // @ts-ignore
        creds = err?.message || 'error: ' + err;
      }

      const data = keys.map(async key => {
        let v: string;

        try {
          v = ((await EncryptedStorage.getItem(key)) || '-') as string;
        } catch (err) {
          v = 'unknown';
        }

        return [key, v] as [string, string];
      });
      Promise.all(data).then(res => {
        const d = res
          // .filter(([_, v]) => !!v)
          .reduce((acc, [key, value]) => {
            try {
              if (typeof value === 'string') {
                value = JSON.parse(value);
              }
            } catch {
              // ignore
            }

            acc[key] = value;
            return acc;
          }, {} as any);
        // @ts-ignore
        d.password = password;
        d.creds = creds;
        d.wallets = Wallet.getAll();
        // @ts-ignore
        d.user = app.getUser()._raw;
        Logger.log('data', JSON.stringify(d, null, 2));

        setEncryptedData(JSON.stringify(d, null, 2));
      });
    }, 2_000);
  }, []);

  if (isReady) {
    return <App1 />;
  }

  return (
    <ScrollView
      style={{
        backgroundColor: getColor(Color.graphicGreen1),
        flex: 1,
      }}
      contentContainerStyle={{
        flex: 1,
        paddingHorizontal: 20,
        // width: Dimensions.get('window').width,
        // height: Dimensions.get('window').height,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <ISLMLogo inverted />

      <Spacer height={10} />

      <First>
        {bruteforceStarted && (
          <>
            <Text variant={TextVariant.t0} color={Color.textBase3}>
              PIN Bruteforcing...
            </Text>
            <Text variant={TextVariant.t13} color={Color.textBase3}>
              {current}
            </Text>
          </>
        )}
        <>
          <View style={{width: '100%'}}>
            <TextField
              label="Encrypted Data"
              placeholder={I18N.empty}
              multiline
              lines={10}
              numberOfLines={10}
              value={encryptedData}
            />
          </View>
          <Spacer height={10} />
          <Button
            variant={ButtonVariant.second}
            title="Copy Encrypted Data"
            onPress={() => {
              Clipboard.setString(encryptedData);
              vibrate(HapticEffects.success);
              Alert.alert('Copied', 'Encrypted data copied to clipboard');
            }}
            style={{width: '100%'}}
          />
          <Spacer height={10} />
          <Button
            variant={ButtonVariant.warning}
            title="Brutforce PIN"
            onPress={bruteforcePin}
            style={{width: '100%'}}
          />
        </>
      </First>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  rootView: {
    flex: 1,
  },
});
