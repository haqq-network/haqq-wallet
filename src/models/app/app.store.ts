import {makeAutoObservable} from 'mobx';
import {isHydrated, makePersistable} from 'mobx-persist-store';
import Config from 'react-native-config';

import {storage} from '@app/services/mmkv';

class AppStore {
  // App session properties
  private _isInitialized = false;

  // Hydrated properties
  isOnboarded = false;
  isDeveloperModeEnabled = Config.IS_DEVELOPMENT === 'true';
  isTesterModeEnabled = Config.IS_TESTMODE === 'true';

  constructor() {
    makeAutoObservable(this);
    makePersistable(this, {
      name: this.constructor.name,
      properties: [
        'isOnboarded',
        'isDeveloperModeEnabled',
        'isTesterModeEnabled',
      ],
      storage,
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
}

const instance = new AppStore();
export {instance as AppStore};
