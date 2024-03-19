/**
 * @format
 */
import './global';
import '@ethersproject/shims';
import '@walletconnect/react-native-compat';
import {AppRegistry, I18nManager, LogBox} from 'react-native';

import Config from 'react-native-config';
import {JsonRpcProvider} from '@ethersproject/providers';
import * as Sentry from '@sentry/react-native';
import {name as appName} from './app.json';
import {App} from './src/app';
import './src/event-actions';
import {Jailbreak} from './src/jailbreak';
import messaging from '@react-native-firebase/messaging';
import {IS_IOS} from '@app/variables/common';
import {DEBUG_VARS} from '@app/debug-vars';
import {Feature, isFeatureEnabled} from '@app/helpers/is-feature-enabled';
import {enableFreeze, enableScreens} from 'react-native-screens';
import {enableBatchedStateUpdates} from '@app/hooks/batched-set-state';

if (!global.BigInt) {
  const BigInt = require('big-integer');

  Object.assign(global, {
    BigInt: BigInt,
  });
}

enableScreens();
enableFreeze(true);
enableBatchedStateUpdates()

LogBox.ignoreLogs(["The 'navigation' object hasn't been initialized"]);

try {
  const isRTLEnabled = isFeatureEnabled(Feature.rtl);
  I18nManager.allowRTL(isRTLEnabled);
  I18nManager.forceRTL(isRTLEnabled);
  I18nManager.swapLeftAndRightInRTL(isRTLEnabled);
} catch (e) {
}

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
    });
  } catch (e) {
    console.log('sentry init failed');
  }
}

function getResult(payload) {
  if (payload.error) {
    const error = new Error(payload.error.message);
    error.code = payload.error.code;
    error.data = payload.error.data;
    throw error;
  }
  return payload.result;
}

JsonRpcProvider.prototype.send = async function (method, params) {
  const request = {
    method: method,
    params: params,
    id: this._nextId++,
    jsonrpc: '2.0',
  };

  const cache = ['eth_chainId', 'eth_blockNumber'].indexOf(method) >= 0;
  if (cache && this._cache[method]) {
    return this._cache[method];
  }

  const req = await fetch(`${this.connection.url}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  const resp = await req.json();
  const result = getResult(resp);
  if (cache) {
    this._cache[method] = result;
    setTimeout(() => {
      this._cache[method] = null;
    }, 0);
  }

  return result;
};

const Wrapped = Sentry.wrap(App);

AppRegistry.registerComponent(appName, () => Wrapped);

AppRegistry.registerComponent('jailbreak', () => Config.FOR_DETOX ? Wrapped : Jailbreak);
