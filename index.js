/**
 * @format
 */

import {AppRegistry} from 'react-native';
import {App} from './src/app';
import {name as appName} from './app.json';
import {JsonRpcProvider} from '@ethersproject/providers';

function getResult(payload) {
  if (payload.error) {
    // @TODO: not any
    var error = new Error(payload.error.message);
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

  console.log(this.connection);

  const req = await fetch(`${this.connection.url}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  const resp = await req.json();

  return getResult(resp);
};

AppRegistry.registerComponent(appName, () => App);
