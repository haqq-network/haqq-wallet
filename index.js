/**
 * @format
 */
import 'react-native-get-random-values';
import '@ethersproject/shims';
import {AppRegistry} from 'react-native';

import {AppWithProviders} from './src/AppWithProviders';
import {name as appName} from './app.json';
import {JsonRpcProvider} from '@ethersproject/providers';
import * as Sentry from '@sentry/react-native';
import {ENVIRONMENT, SENTRY_DSN} from '@env';
import {Overview} from './src/overview';
import './src/event-actions';

if (typeof Buffer === 'undefined') {
  global.Buffer = require('buffer').Buffer;
}

if (SENTRY_DSN) {
  try {
    Sentry.init({
      dsn: SENTRY_DSN,
      // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
      // We recommend adjusting this value in production.
      tracesSampleRate: 1.0,
      environment: ENVIRONMENT ?? 'development',
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

const Wrapped = Sentry.wrap(AppWithProviders);

AppRegistry.registerComponent(appName, () => Wrapped);

AppRegistry.registerComponent('overview', () => Overview);
