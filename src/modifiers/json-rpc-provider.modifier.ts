import {JsonRpcProvider} from '@ethersproject/providers';
import {ethers} from 'ethers';

import {Provider} from '@app/models/provider';
import {EventTracker} from '@app/services/event-tracker';
import {MarketingEvents} from '@app/types';

// FIXME: Investigate and fix types here
function getResult(payload: any) {
  if (payload.error) {
    const error = new Error(payload.error.message);
    //@ts-ignore
    error.code = payload.error.code;
    //@ts-ignore
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

  const isSendMethod =
    ['eth_sendRawTransaction', 'eth_sendTransaction'].indexOf(method) >= 0;

  const cache: boolean = ['eth_chainId', 'eth_blockNumber'].includes(method);
  // FIXME: Looks like this._cache is promise based on type check
  // @ts-ignore
  if (cache && this._cache[method]) {
    return this._cache[method];
  }

  let parsedAddressFrom = 'unknown';
  try {
    const hexString = params[0].replace(/^0x/, '');
    parsedAddressFrom =
      ethers.utils.parseTransaction(Buffer.from(hexString, 'hex'))?.from ??
      'unknown';
  } catch (e) {}

  const eventParams = {
    type: 'EVM',
    network: Provider.selectedProvider.name,
    chainId: `${Provider.selectedProvider.ethChainId}`,
    address: parsedAddressFrom,
  };

  try {
    if (isSendMethod) {
      EventTracker.instance.trackEvent(
        MarketingEvents.sendTxStart,
        eventParams,
      );
    }
    const req = await fetch(`${this.connection.url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (isSendMethod) {
      EventTracker.instance.trackEvent(
        MarketingEvents.sendTxSuccess,
        eventParams,
      );
    }

    const resp = await req.json();
    const result = getResult(resp);
    if (cache) {
      this._cache[method] = result;
      setTimeout(() => {
        // FIXME: Looks like this._cache must be only Promise<any> based on type check
        // @ts-ignore
        this._cache[method] = null;
      }, 0);
    }

    return result;
  } catch (error) {
    if (isSendMethod) {
      EventTracker.instance.trackEvent(MarketingEvents.sendTxFail, eventParams);
    }
    throw error;
  }
};
