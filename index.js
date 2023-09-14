/**
 * @format
 */
import './global'
import '@ethersproject/shims';
import '@walletconnect/react-native-compat'
import {AppRegistry, I18nManager} from 'react-native';

import {ENVIRONMENT, SENTRY_DSN} from '@env';
import {JsonRpcProvider} from '@ethersproject/providers';
import * as Sentry from '@sentry/react-native';
import {name as appName} from './app.json';
import {App} from './src/app';
import './src/event-actions';
import {Overview} from './src/overview';
import {Jailbreak} from './src/jailbreak';
import messaging from '@react-native-firebase/messaging';
import {MMKV} from 'react-native-mmkv'
import {configurePersistable} from 'mobx-persist-store'

if(!global.BigInt){
  const BigInt = require('big-integer');
  
  Object.assign(global, {
    BigInt: BigInt,
  });
}

import './src/event-actions';
import { IS_IOS } from '@app/variables/common';
import {DEBUG_VARS} from '@app/debug-vars';
import { Feature, isFeatureEnabled } from '@app/helpers/is-feature-enabled';

try {
  const isRTLEnabled = isFeatureEnabled(Feature.rtl);
  I18nManager.allowRTL(isRTLEnabled);
  I18nManager.forceRTL(isRTLEnabled);
  I18nManager.swapLeftAndRightInRTL(isRTLEnabled);
} catch (e){}

if (__DEV__ && IS_IOS) {
  messaging().setAPNSToken('dev-apns-token', 'sandbox');
}

if (SENTRY_DSN && DEBUG_VARS.enableSentry) {
  try {
    Sentry.init({
      dsn: SENTRY_DSN,
      // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
      // We recommend adjusting this value in production.
      tracesSampleRate: 1.0,
      environment: ENVIRONMENT ?? 'development',
      enableWatchdogTerminationTracking: false
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

const KEY = 'ENCRYPTION_KEY_FROM_ENV';
const storage = new MMKV({
  id: 'mmkv-storage',
  encryptionKey: KEY,
});

configurePersistable(
  {
    storage: {
      setItem: (key, data) => storage.set(key, data),
      getItem: (key) => storage.getString(key),
      removeItem: (key) => storage.delete(key),
    },
  },
  { delay: 0, fireImmediately: true },
);

AppRegistry.registerComponent(appName, () => Wrapped);

AppRegistry.registerComponent('overview', () => Overview);
AppRegistry.registerComponent('jailbreak', () => Jailbreak);
