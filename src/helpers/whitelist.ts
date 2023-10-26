import {app} from '@app/contexts';
import {DEBUG_VARS} from '@app/debug-vars';
import {RemoteConfig} from '@app/services/remote-config';

import {getHost} from './web3-browser-utils';

export class Whitelist {
  static async check(url: string | undefined): Promise<boolean> {
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
}
