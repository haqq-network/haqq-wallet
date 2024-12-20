import '@walletconnect/react-native-compat';
import 'node-libs-react-native/globals';
import '@ethersproject/shims';
import {AppRegistry, I18nManager, LogBox} from 'react-native';
import './global';
import './src/modifiers/json-rpc-provider.modifier';

import {DEBUG_VARS} from '@app/debug-vars';
import {enableBatchedStateUpdates} from '@app/hooks/batched-set-state';
import {Language} from '@app/models/language';
import {IS_IOS, RTL_LANGUAGES} from '@app/variables/common';
import messaging from '@react-native-firebase/messaging';
import * as Sentry from '@sentry/react-native';
import Config from 'react-native-config';
import {enableFreeze, enableScreens} from 'react-native-screens';
import {name as appName} from './app.json';
import {App} from './src/app';
import './src/event-actions';
import {Jailbreak} from './src/jailbreak';

LogBox.ignoreAllLogs();
if (!global.BigInt) {
  const BigInt = require('big-integer');

  Object.assign(global, {
    BigInt: BigInt,
  });
}

const isRTL = RTL_LANGUAGES.includes(Language.current);
I18nManager.allowRTL(isRTL);

enableScreens();
enableFreeze(true);
enableBatchedStateUpdates();

LogBox.ignoreLogs(["The 'navigation' object hasn't been initialized"]);

if (__DEV__ && IS_IOS) {
  messaging().setAPNSToken('dev-apns-token', 'sandbox');
}

if (Config.SENTRY_DSN && DEBUG_VARS.enableSentry) {
  try {
    Sentry.init({
      dsn: Config.SENTRY_DSN,
      // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
      // We recommend adjusting this value in production.
      tracesSampleRate: 1.0,
      environment: Config.ENVIRONMENT ?? 'development',
      enableWatchdogTerminationTracking: false,
      attachScreenshot: true,
      attachStacktrace: true,
      beforeSend(event, hint) {
        if (event.level !== 'fatal') {
          delete hint.attachments;
        }
        return event;
      },
    });
  } catch (e) {
    console.log('sentry init failed');
  }
}

const Wrapped = DEBUG_VARS.enableSentry ? Sentry.wrap(App) : App;

AppRegistry.registerComponent(appName, () => Wrapped);

AppRegistry.registerComponent('jailbreak', () =>
  Config.FOR_DETOX ? Wrapped : Jailbreak,
);
