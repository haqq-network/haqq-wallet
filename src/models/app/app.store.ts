import {isHydrated, makePersistable} from '@override/mobx-persist-store';
import {makeAutoObservable, runInAction} from 'mobx';
import Config from 'react-native-config';
import {
  startNetworkLogging,
  stopNetworkLogging,
} from 'react-native-network-logger';

import {storage} from '@app/services/mmkv';
import {DataFetchSource} from '@app/types';

class AppStore {
  // App session properties
  private _isInitialized = false;

  // Hydrated properties
  private _isOnboarded = false;
  private _networkLoggerEnabled = false;
  private _networkLogsCacheSize = 500; // count of stored http request
  private _testnetsEnabledForAllNetworks = true;
  private _dataFetchMode: DataFetchSource = DataFetchSource.Backend;
  isDeveloperModeEnabled = Config.IS_DEVELOPMENT === 'true';
  isTesterModeEnabled = Config.IS_TESTMODE === 'true';

  constructor() {
    makeAutoObservable(this);
    makePersistable(this, {
      name: this.constructor.name,
      properties: [
        '_isOnboarded' as keyof this,
        '_networkLoggerEnabled' as keyof this,
        '_testnetsEnabledForAllNetworks' as keyof this,
        '_networkLogsCacheSize' as keyof this,
        '_dataFetchMode' as keyof this,
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

  get dataFetchMode() {
    return this._dataFetchMode;
  }

  set dataFetchMode(value: DataFetchSource) {
    runInAction(() => {
      this._dataFetchMode = value;
    });
  }

  get isRpcOnly() {
    return this.dataFetchMode === DataFetchSource.Rpc;
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
    if (Config.IS_DEVELOPMENT === 'true') {
      return true;
    }
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

  get isDetoxRunning() {
    return IS_DETOX;
  }
}

const instance = new AppStore();
export {instance as AppStore};
