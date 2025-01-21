import {makeAutoObservable, runInAction} from 'mobx';
import {isHydrated, makePersistable} from 'mobx-persist-store';
import Config from 'react-native-config';
import {
  startNetworkLogging,
  stopNetworkLogging,
} from 'react-native-network-logger';

import {storage} from '@app/services/mmkv';

class AppStore {
  // App session properties
  private _isInitialized = false;

  // Hydrated properties
  _isOnboarded = false;
  _networkLoggerEnabled = false;
  _networkLogsCacheSize = 500; // count of stored http request
  _testnetsEnabledForAllNetworks = true;
  isDeveloperModeEnabled = Config.IS_DEVELOPMENT === 'true';
  isTesterModeEnabled = Config.IS_TESTMODE === 'true';

  constructor() {
    makeAutoObservable(this);
    makePersistable(this, {
      name: this.constructor.name,
      properties: [
        '_isOnboarded',
        '_networkLoggerEnabled',
        '_testnetsEnabledForAllNetworks',
        '_networkLogsCacheSize',
        'isDeveloperModeEnabled',
        'isTesterModeEnabled',
      ],
      storage,
    });
  }

  get isOnboarded() {
    return this._isOnboarded;
  }

  set isOnboarded(value: boolean) {
    runInAction(() => {
      this._isOnboarded = value;
    });
  }

  get isInitialized() {
    return isHydrated(this) && this._isInitialized;
  }
  set isInitialized(value: boolean) {
    this._isInitialized = value;
  }

  get isAdditionalFeaturesEnabled() {
    return this.isDeveloperModeEnabled || this.isTesterModeEnabled;
  }
  get isLogsEnabled() {
    return __DEV__ || this.isAdditionalFeaturesEnabled;
  }

  get networkLoggerEnabled() {
    // only for developer mode
    if (!this.isAdditionalFeaturesEnabled) {
      return false;
    }
    return this._networkLoggerEnabled ?? false;
  }

  set networkLoggerEnabled(value: boolean) {
    runInAction(() => {
      this._networkLoggerEnabled = value;
    });

    if (value) {
      startNetworkLogging({
        forceEnable: true,
        ignoredPatterns: [/posthog\.com/, /google\.com/],
        maxRequests: this.networkLogsCacheSize,
      });
    } else {
      stopNetworkLogging();
    }
  }

  get networkLogsCacheSize() {
    return this._networkLogsCacheSize;
  }

  set networkLogsCacheSize(value: number) {
    runInAction(() => {
      this._networkLogsCacheSize = value;
    });
  }

  get testnetsEnabledForAllNetworks() {
    return this._testnetsEnabledForAllNetworks;
  }

  set testnetsEnabledForAllNetworks(value: boolean) {
    runInAction(() => {
      this._testnetsEnabledForAllNetworks = value;
    });
  }
}

const instance = new AppStore();
export {instance as AppStore};
