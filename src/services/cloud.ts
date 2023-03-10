import {NativeModules} from 'react-native';

import {StorageInterface} from '@app/services/provider-mpc';

const {RNCloud} = NativeModules;

export class Cloud implements StorageInterface {
  static isEnabled() {
    return Promise.resolve(RNCloud.isSupported && RNCloud.isEnabled);
  }

  getName() {
    return 'cloud';
  }

  hasItem(key: string): Promise<boolean> {
    return RNCloud.hasItem(key);
  }

  getItem(key: string): Promise<string | null> {
    return RNCloud.getItem(key).catch(() => null);
  }

  setItem(key: string, value: string): Promise<boolean> {
    return RNCloud.setItem(key, value);
  }

  removeItem(key: string): Promise<boolean> {
    return RNCloud.removeItem(key);
  }
}
