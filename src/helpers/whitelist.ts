import {jsonrpcRequest} from '@haqq/shared-react-native';

import {app} from '@app/contexts';
import {DEBUG_VARS} from '@app/debug-vars';
import {Cosmos} from '@app/services/cosmos';
import {RemoteConfig} from '@app/services/remote-config';
import {VerifyAddressResponse} from '@app/types';
import {isHaqqAddress} from '@app/utils';

import {getHost} from './web3-browser-utils';

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

  static async checkAddress(address: string): Promise<boolean> {
    const result = await Whitelist.verifyAddress(address);
    return !!result?.isInWhiteList;
  }

  static async verifyAddress(address: string) {
    if (!app.provider.indexer || !address) {
      return null;
    }

    try {
      const haqqAddress = isHaqqAddress(address)
        ? address
        : Cosmos.addressToBech32(address);

      return await jsonrpcRequest<VerifyAddressResponse | null>(
        app.provider.indexer,
        'address',
        [haqqAddress],
      );
    } catch (err) {
      Logger.error('verifyAddress', err);
      return null;
    }
  }
}
