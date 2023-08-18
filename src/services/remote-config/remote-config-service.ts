import {VariablesString} from '@app/models/variables-string';
import {isValidJSON} from '@app/utils';

import {RemoteConfigTypes} from './remote-config-types';

import {Backend} from '../backend';

const KEY = 'remote-config-cache';

const logger = Logger.create('RemoteConfig', {
  emodjiPrefix: '🔴',
  stringifyJson: true,
});

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
      const config = await Backend.instance.getRemoteConfig();
      Logger.log('config', config);
      if (Object.keys(config).length) {
        VariablesString.set(KEY, JSON.stringify(config));
        RemoteConfig.isInited = true;
        return config;
      } else {
        logger.error('remote config is empty', config);
        return undefined;
      }
    } catch (err) {
      logger.error('failed to fetch remote config', err);
      return undefined;
    }
  }

  public static set(config: RemoteConfigTypes) {
    if (Object.keys(config).length) {
      VariablesString.set(KEY, JSON.stringify(config));
    } else {
      logger.error('remote config is empty', config);
    }
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
    const cacheString = VariablesString.get(KEY);

    if (isValidJSON(cacheString)) {
      return JSON.parse(cacheString);
    }

    logger.error('not valid JSON', cacheString);
    return undefined;
  }
}
