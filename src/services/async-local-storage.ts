import {StorageInterface} from '@haqq/provider-sss-react-native';
import RNAsyncStorage from '@react-native-async-storage/async-storage';

export class AsyncLocalStorage implements StorageInterface {
  static isEnabled() {
    return Promise.resolve(true);
  }

  getName() {
    return 'local';
  }

  getItem(key: string) {
    return RNAsyncStorage.getItem(key);
  }

  setItem(key: string, value: string) {
    return RNAsyncStorage.setItem(key, value)
      .then(() => true)
      .catch(() => false);
  }

  hasItem(key: string) {
    return RNAsyncStorage.getAllKeys().then(keys => keys.includes(key));
  }

  removeItem(key: string): Promise<boolean> {
    return RNAsyncStorage.removeItem(key)
      .then(() => true)
      .catch(() => false);
  }
}
