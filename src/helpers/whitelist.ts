import {JSONRPCError, jsonrpcRequest} from '@haqq/shared-react-native';

import {app} from '@app/contexts';
import {DEBUG_VARS} from '@app/debug-vars';
import {
  INDEXER_PROXY_ENDPOINT,
  Provider,
  ProviderModel,
} from '@app/models/provider';
import {Token} from '@app/models/tokens';
import {VariablesString} from '@app/models/variables-string';
import {Wallet} from '@app/models/wallet';
import {Indexer} from '@app/services/indexer';
import {AddressType, IContract, VerifyAddressResponse} from '@app/types';
import {MAINNET_ETH_CHAIN_ID} from '@app/variables/common';

import {AddressUtils, NATIVE_TOKEN_ADDRESS} from './address-utils';

const CACHE_KEY = 'whitelist';
const CACHE_LIFE_TIME = 3 * 60 * 60 * 1000; // 3 hours

const logger = Logger.create('Whitelist', {stringifyJson: true});

type CachedVerifyAddressResponse = VerifyAddressResponse & {
  cachedAt?: number;
};

const getParsedAddressList = (address: string | string[]) => {
  if (typeof address === 'string') {
    return [AddressUtils.toHaqq(address)];
  }

  if (Array.isArray(address)) {
    return address.map(AddressUtils.toHaqq);
  }

  return [];
};

export class Whitelist {
  /**
   * @param url - url to check
   * @param enableForceSkip - if true, then whitelist will be ignored if DEBUG_VARS.disableWeb3DomainBlocking or app.isTesterMode is true
   *
   * set enableForceSkip to false if you want to check whitelist without force skip
   */
  static async checkUrl(
    url: string | undefined,
    enableForceSkip = true,
  ): Promise<boolean> {
    if (!url) {
      return false;
    }

    logger.log('checkUrl', {url, enableForceSkip});

    if (
      enableForceSkip &&
      (DEBUG_VARS.disableWeb3DomainBlocking || app.isTesterMode)
    ) {
      return true;
    }

    return await Indexer.instance.validateDappDomain(url);
  }

  static async verifyAddress(
    address: string,
    provider?: ProviderModel,
    force = false,
  ) {
    provider = provider ?? Provider.selectedProvider;
    const chainId = Provider.isAllNetworks
      ? MAINNET_ETH_CHAIN_ID
      : provider.ethChainId;
    const isWallet = Wallet.getAll().some(wallet =>
      AddressUtils.equals(wallet.address, address),
    );

    if (isWallet) {
      return {
        address_type: AddressType.wallet,
        id: AddressUtils.toHaqq(address),
      } as IContract;
    }

    if (!provider.indexer || !address) {
      return null;
    }

    if (AddressUtils.equals(address, NATIVE_TOKEN_ADDRESS)) {
      return Token.generateNativeTokenContracts()[0];
    }

    const key = `${CACHE_KEY}:${JSON.stringify(address)}`;
    let responseFromCache: CachedVerifyAddressResponse | null = null;
    if (!force) {
      try {
        const cache = VariablesString.get(key);
        if (cache) {
          responseFromCache = JSON.parse(cache);

          // Cache is valid for 3 hour
          if (
            responseFromCache?.cachedAt &&
            responseFromCache.cachedAt + CACHE_LIFE_TIME > Date.now()
          ) {
            return responseFromCache.address[chainId];
          }
        }
      } catch (err) {
        logger.error('verifyAddress from cache', err);
      }
    }

    try {
      const params: any[] = getParsedAddressList(address);
      if (!Provider.isAllNetworks) {
        params.push(provider.ethChainId);
      }

      const response = await jsonrpcRequest<VerifyAddressResponse | null>(
        INDEXER_PROXY_ENDPOINT,
        'address',
        params,
      );

      if (response) {
        const responseForCache = JSON.stringify({
          ...response,
          cachedAt: Date.now(),
        });
        VariablesString.set(key, responseForCache);
      }

      return response?.address[chainId] ?? null;
    } catch (err) {
      if (err instanceof JSONRPCError) {
        Logger.captureException(err, 'Whitelist:verifyAddress', err.meta);
      }
      logger.error('verifyAddress', err);

      if (responseFromCache) {
        return responseFromCache.address[chainId];
      }

      return null;
    }
  }
}
