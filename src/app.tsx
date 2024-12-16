import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {ActionSheetProvider} from '@expo/react-native-action-sheet';
import NetInfo, {NetInfoState} from '@react-native-community/netinfo';
import {
  DefaultTheme,
  NavigationAction,
  NavigationContainer,
  Theme,
} from '@react-navigation/native';
import * as Sentry from '@sentry/react-native';
import {when} from 'mobx';
import {observer} from 'mobx-react';
import PostHog, {PostHogProvider} from 'posthog-react-native';
import {AppState, Dimensions, Linking, StyleSheet} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {MenuProvider} from 'react-native-popup-menu';
import {Metrics, SafeAreaProvider} from 'react-native-safe-area-context';
import SplashScreen from 'react-native-splash-screen';

import {Color} from '@app/colors';
import {AppScreenSecurityOverview} from '@app/components/app-screen-security-overview';
import {SocketHandler} from '@app/components/socket-handler';
import {app} from '@app/contexts';
import {Events} from '@app/events';
import {createTheme, hideModal, showModal} from '@app/helpers';
import {awaitForEventDone} from '@app/helpers/await-for-event-done';
import {useTheme} from '@app/hooks';
import {useToast} from '@app/hooks/use-toast';
import {Language} from '@app/models/language';
import {Stories} from '@app/models/stories';
import {VariablesBool} from '@app/models/variables-bool';
import {navigator} from '@app/navigator';
import {
  KeystoneStackRoutes,
  LedgerStackRoutes,
  OnboardingStackRoutes,
  SssMigrateStackRoutes,
} from '@app/route-types';
import {RootStack} from '@app/screens/RootStack';
import {AppTheme, ModalType} from '@app/types';
import {sleep} from '@app/utils';
import {SPLASH_TIMEOUT_MS} from '@app/variables/common';

import {AppVersionAbsoluteView} from './components/app-version-absolute-view';
import {AppStore} from './models/app';
import {migrationWallets} from './models/migration-wallets';
import {Wallet} from './models/wallet';
import {EventTracker} from './services/event-tracker';

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

export const App = observer(() => {
  const [isPinReseted, setPinReseted] = useState(false);

  const [posthog, setPosthog] = useState<PostHog | null>(null);
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
    const splashTimer = setTimeout(() => {
      hideModal(ModalType.splash);
    }, SPLASH_TIMEOUT_MS);
    sleep(150)
      .then(async () => await app.awaitForInitialization())
      .then(() => SplashScreen.hide())
      .then(async () => await awaitForEventDone(Events.onAppInitialized))
      .then(async () => await Language.init())
      .then(async () => {
        await when(() => Wallet.isHydrated);
        await Stories.fetch(true);
        if (AppStore.isOnboarded || Wallet.getAll().length > 0) {
          await app.init();
          await migrationWallets();

          // We need reopen app for start SSS check
          // because we are working with cloud snapshots
          VariablesBool.set('isReadyForSSSVerification', true);
        }
      })
      .then(() => {
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
        AppStore.isInitialized = true;
        hideModal(ModalType.splash);
      });

    return () => {
      clearTimeout(splashTimer);
    };
  }, []);

  useEffect(() => {
    if (AppStore.isInitialized) {
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
  }, [AppStore.isInitialized]);

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
                    routeToProperties: (_, params) => {
                      return params;
                    },
                  },
                }}>
                <RootStack isPinReseted={isPinReseted} />
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
});

const styles = StyleSheet.create({
  rootView: {
    flex: 1,
  },
});
