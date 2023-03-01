/**
 * @format
 */
import '@ethersproject/shims';
import {AppRegistry} from 'react-native';
import 'react-native-get-random-values';

import {ENVIRONMENT, SENTRY_DSN} from '@env';
import {JsonRpcProvider} from '@ethersproject/providers';
import * as Sentry from '@sentry/react-native';
import {name as appName} from './app.json';
import {App} from './src/app';
import './src/event-actions';
import {Overview} from './src/overview';

const TextEncodingPolyfill = require('text-encoding');
const BigInt = require('big-integer');
const Buffer = require('buffer');

Object.assign(global, {
  TextEncoder: TextEncodingPolyfill.TextEncoder,
  TextDecoder: TextEncodingPolyfill.TextDecoder,
  BigInt: BigInt,
  Buffer: Buffer.Buffer,
});

import './src/event-actions';
import { DEBUG_VARS } from '@app/debug-vars';

if (typeof Buffer === 'undefined') {
  global.Buffer = require('buffer').Buffer;
}

if (SENTRY_DSN && DEBUG_VARS.enableSentry) {
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

const Wrapped = Sentry.wrap(App);

AppRegistry.registerComponent(appName, () => Wrapped);

AppRegistry.registerComponent('overview', () => Overview);
