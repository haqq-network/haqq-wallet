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
import * as Sentry from '@sentry/react-native';
import {AppState, Linking, Platform, StyleSheet} from 'react-native';
import {Adjust, AdjustConfig} from 'react-native-adjust';
import {AdjustOaid} from 'react-native-adjust-oaid';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import SplashScreen from 'react-native-splash-screen';

import {Color} from '@app/colors';
import {app} from '@app/contexts';
import {Events} from '@app/events';
import {createTheme, hideModal, showModal} from '@app/helpers';
import {awaitForEventDone} from '@app/helpers/await-for-event-done';
import {trackEvent} from '@app/helpers/track-event';
import {useTheme} from '@app/hooks';
import {navigator} from '@app/navigator';
import {RootStack} from '@app/screens/RootStack';
import {AppTheme} from '@app/types';
import {getAppTrackingAuthorizationStatus, sleep} from '@app/utils';

import {migrationWallets} from './models/migration-wallets';

const appTheme = createTheme({
  colors: {
    ...DefaultTheme.colors,
    primary: Color.graphicGreen1,
    background: Color.bg1,
  },
});

export const App = () => {
  const [initialized, setInitialized] = useState(false);
  const [isPinReseted, setPinReseted] = useState(false);
  const [onboarded, setOnboarded] = useState(false);
  const [isWelcomeNewsEnabled, setIsWelcomeNewsEnabled] = useState(false);
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
      .then(() => {
        setOnboarded(app.onboarded);
        setIsWelcomeNewsEnabled(app.isWelcomeNewsEnabled);
        app.addListener(Events.onOnboardedChanged, setOnboarded);
        app.addListener(Events.onIsWelcomeNewsChanged, setIsWelcomeNewsEnabled);
        awaitForEventDone(Events.onAppLoggedId);
      })
      .catch(async e => {
        Logger.captureException(e, 'app init');
      })
      .finally(async () => {
        await awaitForEventDone(Events.onAppStarted);
        setInitialized(true);
      });

    return () => {
      app.removeAllListeners(Events.onOnboardedChanged);
      app.removeAllListeners(Events.onIsWelcomeNewsChanged);
    };
  }, []);

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

  const onUnhandledAction = useCallback((action: NavigationAction) => {
    if (action.type === 'reset-pin') {
      setPinReseted(true);
    }
  }, []);

  return (
    <GestureHandlerRootView style={styles.rootView}>
      <ActionSheetProvider>
        <SafeAreaProvider>
          <NavigationContainer
            onUnhandledAction={onUnhandledAction}
            ref={navigator}
            theme={navTheme}
            onStateChange={onStateChange}>
            <RootStack
              onboarded={onboarded}
              isWelcomeNewsEnabled={isWelcomeNewsEnabled}
              isPinReseted={isPinReseted}
              isReady={initialized}
            />
          </NavigationContainer>
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
