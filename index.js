/**
 * @format
 */

import {AppRegistry} from 'react-native';
import {App} from './src/app';
import {name as appName} from './app.json';
import {JsonRpcProvider} from '@ethersproject/providers';
import * as Sentry from '@sentry/react-native';
console.log('init app');
Sentry.init({
  dsn: 'https://7a89fad62ad7450fbf03fa4426d14a92@o1347520.ingest.sentry.io/6626256',
  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
  // We recommend adjusting this value in production.
  tracesSampleRate: 1.0,
});

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

  console.log(JSON.stringify(request));

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
