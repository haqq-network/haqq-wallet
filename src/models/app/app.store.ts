import {makeAutoObservable} from 'mobx';
import {isHydrated, makePersistable} from 'mobx-persist-store';

import {storage} from '@app/services/mmkv';

class AppStore {
  // App session properties
  private _isInitialized = false;

  // Hydrated properties
  isOnboarded = false;

  constructor() {
    makeAutoObservable(this);
    makePersistable(this, {
      name: this.constructor.name,
      properties: ['isOnboarded'],
      storage,
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
