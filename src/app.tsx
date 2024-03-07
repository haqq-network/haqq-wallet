import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {ADJUST_ENVIRONMENT, ADJUST_TOKEN} from '@env';
import {ActionSheetProvider} from '@expo/react-native-action-sheet';
import NetInfo, {NetInfoState} from '@react-native-community/netinfo';
import {
  DefaultTheme,
  NavigationAction,
  NavigationContainer,
  Theme as RNTheme,
} from '@react-navigation/native';
import * as Sentry from '@sentry/react-native';
import {AppState, Linking, Platform, StyleSheet} from 'react-native';
import {Adjust, AdjustConfig} from 'react-native-adjust';
import {AdjustOaid} from 'react-native-adjust-oaid';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {MenuProvider} from 'react-native-popup-menu';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import SplashScreen from 'react-native-splash-screen';

import {AppScreenSecurityOverview} from '@app/components/app-screen-security-overview';
import {app} from '@app/contexts';
import {Events} from '@app/events';
import {hideModal, showModal} from '@app/helpers';
import {awaitForEventDone} from '@app/helpers/await-for-event-done';
import {trackEvent} from '@app/helpers/track-event';
import {useToast} from '@app/hooks/use-toast';
import {Contact} from '@app/models/contact';
import {VariablesBool} from '@app/models/variables-bool';
import {Wallet} from '@app/models/wallet';
import {navigator} from '@app/navigator';
import {
  KeystoneStackRoutes,
  LedgerStackRoutes,
  OnboardingStackRoutes,
  SssMigrateStackRoutes,
} from '@app/route-types';
import {RootStack} from '@app/screens/RootStack';
import {AppTheme, Color, Theme, createTheme} from '@app/theme';
import {ModalType} from '@app/types';
import {getAppTrackingAuthorizationStatus, sleep} from '@app/utils';
import {SPLASH_TIMEOUT_MS} from '@app/variables/common';

import {migrationWallets} from './models/migration-wallets';

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

export const App = () => {
  const [initialized, setInitialized] = useState(false);
  const [isPinReseted, setPinReseted] = useState(false);
  const [onboarded, setOnboarded] = useState(app.onboarded);
  const toast = useToast();

  const navTheme = useMemo(
    () =>
      ({
        dark: Theme.currentTheme === AppTheme.dark,
        colors: appTheme.colors,
      }) as RNTheme,
    [Theme.currentTheme],
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
      .then(async () => {
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

      // Adjust.getAdid((adid) => {
      // Logger.log('Adid = ' + adid);
      // });
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

    const currentRouteName = navigator?.getCurrentRoute?.()?.name;
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

  return (
    <GestureHandlerRootView style={styles.rootView}>
      <ActionSheetProvider>
        <SafeAreaProvider>
          <MenuProvider>
            <NavigationContainer
              onUnhandledAction={onUnhandledAction}
              ref={navigator}
              theme={navTheme}
              onStateChange={onStateChange}>
              <RootStack
                onboarded={onboarded}
                isPinReseted={isPinReseted}
                isReady={initialized}
              />
              <AppScreenSecurityOverview />
              {toast}
            </NavigationContainer>
          </MenuProvider>
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
