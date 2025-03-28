import {getAppInfo} from '@app/helpers/get-app-info';
import {Initializable} from '@app/helpers/initializable';
import {AppStore} from '@app/models/app';
import {VariablesString} from '@app/models/variables-string';
import {RemoteConfigTypes} from '@app/services/remote-config';
import {isValidJSON} from '@app/utils';

import {REMOTE_CONFIG_DEFAULT_VALUES} from './remote-config-default-values';

import {Backend} from '../backend';

const KEY = 'remote-config-cache';
const CONFIG_REINIT_TIMEOUT = 5 * 60 * 1000; // 5 minutes

const logger = Logger.create('RemoteConfig', {
  emodjiPrefix: '🔴',
  stringifyJson: true,
  enabled: !__DEV__ && AppStore.isDeveloperModeEnabled,
});

function getCachedConfig() {
  const cacheString = VariablesString.get(KEY);
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
  public async init(force = false): Promise<RemoteConfigTypes | undefined> {
    try {
      if (RemoteConfigService.instance.isInited && !force) {
        return RemoteConfigService.instance.getAll();
      }
      this.startInitialization();

      let config: RemoteConfigTypes | null = null;

      try {
        config = await Backend.instance.getRemoteConfig(await getAppInfo());
      } catch {}

      if (!config) {
        config = getCachedConfig();
      }

      logger.log('config', config);
      if (Object.keys(config).length) {
        VariablesString.set(KEY, JSON.stringify(config));
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
