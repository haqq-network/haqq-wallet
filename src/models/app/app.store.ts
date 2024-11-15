import {makeAutoObservable} from 'mobx';
import {isHydrated, makePersistable} from 'mobx-persist-store';
import Config from 'react-native-config';

class AppStore {
  // App session properties
  private _isInitialized = false;

  // Hydrated properties
  isOnboarded = false;
  isDeveloperModeEnabled = Config.IS_DEVELOPMENT === 'true';

  constructor() {
    makeAutoObservable(this);
    makePersistable(this, {
      name: this.constructor.name,
      properties: ['isOnboarded'],
    });
  }

  get isInitialized() {
    return isHydrated(this) && this._isInitialized;
  }
  set isInitialized(value: boolean) {
    this._isInitialized = value;
  }
}

const instance = new AppStore();
export {instance as AppStore};
