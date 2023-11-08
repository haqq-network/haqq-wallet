import {getAppInfo} from '@app/helpers/get-app-info';
import {VariablesString} from '@app/models/variables-string';
import {Backend} from '@app/services/backend';
import {RemoteConfigTypes} from '@app/services/remote-config/remote-config-types';
import {isValidJSON} from '@app/utils';

import {REMOTE_CONFIG_DEFAULT_VALUES} from './remote-config-default-values';

const KEY = 'remote-config-cache';
const CONFIG_REINIT_TIMEOUT = 5 * 60 * 1000; // 5 minutes

const logger = Logger.create('RemoteConfig', {
  emodjiPrefix: '🔴',
  stringifyJson: true,
});

function getCachedConfig() {
  const cacheString = VariablesString.get(KEY);
  if (isValidJSON(cacheString)) {
    return JSON.parse(cacheString) as RemoteConfigTypes;
  }
  return REMOTE_CONFIG_DEFAULT_VALUES;
}

export class RemoteConfig {
  public static isInited = false;
  public static KEY = KEY;

  /**
   * @return `true` if remote config is successfully initialized
   */
  public static async init(): Promise<RemoteConfigTypes | undefined> {
    try {
      if (RemoteConfig.isInited) {
        return RemoteConfig.getAll();
      }

      const appInfo = await getAppInfo();
      const config = await Backend.instance.getRemoteConfig(appInfo);

      logger.log('config', config);

      if (Object.keys(config).length) {
        VariablesString.set(KEY, JSON.stringify(config));
        RemoteConfig.isInited = true;
        return config;
      } else {
        logger.error('remote config is empty', config);
        return getCachedConfig();
      }
    } catch (err) {
      logger.error('failed to fetch remote config', err);
      setTimeout(RemoteConfig.init, CONFIG_REINIT_TIMEOUT);
      return getCachedConfig();
    }
  }

  public static get_env<K extends keyof RemoteConfigTypes>(
    key: K,
    env: string | undefined,
  ) {
    if (env) {
      return env;
    }

    return RemoteConfig.get(key);
  }

  public static get<K extends keyof RemoteConfigTypes>(
    key: K,
  ): RemoteConfigTypes[K] | undefined {
    const config = RemoteConfig.getAll();
    if (config) {
      return config[key];
    }
    return undefined;
  }

  public static getAll(): RemoteConfigTypes | undefined {
    return getCachedConfig();
  }
}
