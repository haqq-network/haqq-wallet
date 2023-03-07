import RNAsyncStorage from '@react-native-async-storage/async-storage';

import {StorageInterface} from '@app/services/provider-mpc';

export class AsyncLocalStorage implements StorageInterface {
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
}
