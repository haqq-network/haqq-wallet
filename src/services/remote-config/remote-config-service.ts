import {onRemoteConfigSync} from '@app/event-actions/on-remote-config-sync';
import {getAppInfo} from '@app/helpers/get-app-info';
import {Initializable} from '@app/helpers/initializable';
import {VariableString} from '@app/models/variables-string';
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
  const cacheString = VariableString.get(KEY);
  if (isValidJSON(cacheString)) {
    return {
      ...REMOTE_CONFIG_DEFAULT_VALUES,
      ...JSON.parse(cacheString),
    } as RemoteConfigTypes;
  }
  return REMOTE_CONFIG_DEFAULT_VALUES;
}

export class RemoteConfigService extends Initializable {
  static instance = new RemoteConfigService();
  public isInited = false;
  public KEY = KEY;

  /**
   * @return `true` if remote config is successfully initialized
   */
  public async init(): Promise<RemoteConfigTypes | undefined> {
    try {
      if (RemoteConfigService.instance.isInited) {
        return RemoteConfigService.instance.getAll();
      }
      this.startInitialization();
      const appInfo = await getAppInfo();
      const config = await Backend.instance.getRemoteConfig(appInfo);

      // logger.log(JSON.stringify(config, null, 2));

      if (Object.keys(config).length) {
        VariableString.set(KEY, JSON.stringify(config));
        RemoteConfigService.instance.isInited = true;
      } else {
        logger.error('remote config is empty', config);
      }
    } catch (err) {
      logger.error('failed to fetch remote config', err);
      setTimeout(
        RemoteConfigService.instance.init.bind(this),
        CONFIG_REINIT_TIMEOUT,
      );
    }

    await onRemoteConfigSync();
    this.stopInitialization();
    return getCachedConfig();
  }

  public get_env<K extends keyof RemoteConfigTypes>(
    key: K,
    env: string | undefined,
  ) {
    if (env) {
      return env;
    }

    return RemoteConfigService.instance.get(key);
  }

  public get<K extends keyof RemoteConfigTypes>(
    key: K,
  ): RemoteConfigTypes[K] | undefined {
    const config = RemoteConfigService.instance.getAll();
    if (config) {
      return config[key];
    }
    return undefined;
  }

  public safeGet<K extends keyof RemoteConfigTypes>(
    key: K,
  ): RemoteConfigTypes[K] {
    const result = RemoteConfigService.instance.get(key);

    if (result) {
      return result;
    }

    return REMOTE_CONFIG_DEFAULT_VALUES[key];
  }

  public getAll(): RemoteConfigTypes | undefined {
    return getCachedConfig();
  }
}

export const RemoteConfig = RemoteConfigService.instance;
