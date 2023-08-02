import {VariablesString} from '@app/models/variables-string';
import {isValidJSON} from '@app/utils';

import {RemoteConfigTypes} from './remote-config-types';

import {Backend} from '../backend';

const KEY = 'remote-config-cache';

const logger = Logger.create('RemoteConfig', {emodjiPrefix: '🔴'});
export class RemoteConfig {
  public static isInited = false;
  public static KEY = KEY;

  /**
   * @return `true` if remote config is successfully initialized
   */
  public static async init(): Promise<boolean> {
    try {
      if (RemoteConfig.isInited) {
        return true;
      }
      const config = await Backend.instance.getRemoteConfig();
      if (Object.keys(config).length) {
        VariablesString.set(KEY, JSON.stringify(config));
        RemoteConfig.isInited = true;
        return true;
      } else {
        logger.error('remote config is empty', config);
        return false;
      }
    } catch (err) {
      logger.error('failed to fetch remote config', err);
      return false;
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
    const cacheString = VariablesString.get(KEY);

    if (isValidJSON(cacheString)) {
      const config = JSON.parse(cacheString);
      const value = config[key];
      return value;
    }

    logger.error('not valid JSON', cacheString);
    return undefined;
  }
}
