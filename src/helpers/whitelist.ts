import {jsonrpcRequest} from '@haqq/shared-react-native';

import {app} from '@app/contexts';
import {DEBUG_VARS} from '@app/debug-vars';
import {VariablesString} from '@app/models/variables-string';
import {Cosmos} from '@app/services/cosmos';
import {RemoteConfig} from '@app/services/remote-config';
import {VerifyAddressResponse} from '@app/types';
import {isHaqqAddress} from '@app/utils';

import {getHost} from './web3-browser-utils';

const CACHE_KEY = 'whitelist';
const CACHE_LIFE_TIME = 3 * 60 * 60 * 1000; // 3 hours

const logger = Logger.create('Whitelist', {});

type CachedVerifyAddressResponse = VerifyAddressResponse & {
  cachedAt?: number;
};

const getParsedAddressList = (address: string | string[]) => {
  if (typeof address === 'string') {
    return isHaqqAddress(address)
      ? [address]
      : [Cosmos.addressToBech32(address)];
  }

  if (Array.isArray(address)) {
    return address.map(item =>
      isHaqqAddress(item) ? item : Cosmos.addressToBech32(item),
    );
  }

  return [];
};

export class Whitelist {
  static async checkUrl(url: string | undefined): Promise<boolean> {
    if (!url) {
      return false;
    }

    if (DEBUG_VARS.disableWeb3DomainBlocking || app.isTesterMode) {
      return true;
    }

    if (!RemoteConfig.isInited) {
      await RemoteConfig.init();
    }

    const host = getHost(url);
    const web3_app_whitelist = RemoteConfig.get('web3_app_whitelist');

    if (web3_app_whitelist) {
      if (web3_app_whitelist.length === 0) {
        return true;
      }

      return web3_app_whitelist.some(pattern => getHost(pattern) === host);
    }

    return false;
  }

  static async checkAddress(
    address: string | string[],
    provider = app.provider,
  ): Promise<boolean> {
    const result = await Whitelist.verifyAddress(address, provider);
    return !!result?.isInWhiteList;
  }

  static async verifyAddress(
    address: string | string[],
    provider = app.provider,
  ) {
    if (!provider.indexer || !address) {
      return null;
    }

    const key = `${CACHE_KEY}:${JSON.stringify(address)}:${provider.id}`;
    let responseFromCache: CachedVerifyAddressResponse | null = null;

    try {
      const cache = VariablesString.get(key);
      if (cache) {
        responseFromCache = JSON.parse(cache);

        // Cache is valid for 3 hour
        if (
          responseFromCache?.cachedAt &&
          responseFromCache.cachedAt + CACHE_LIFE_TIME > Date.now()
        ) {
          return responseFromCache;
        }
      }
    } catch (err) {
      logger.error('verifyAddress from cache', err);
    }

    try {
      const haqqAddressList = getParsedAddressList(address);

      const response = await jsonrpcRequest<VerifyAddressResponse | null>(
        provider.indexer,
        'address',
        haqqAddressList,
      );

      if (response) {
        const responseForCache = JSON.stringify({
          ...response,
          cachedAt: Date.now(),
        });
        VariablesString.set(key, responseForCache);
      }

      return response;
    } catch (err) {
      logger.error('verifyAddress', err);

      if (responseFromCache) {
        return responseFromCache;
      }

      return null;
    }
  }
}
