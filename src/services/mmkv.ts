import {MMKV_KEY} from '@env';
import {StorageController} from 'mobx-persist-store';
import {MMKV} from 'react-native-mmkv';

const instance = new MMKV({
  id: 'mmkv-storage',
  encryptionKey: MMKV_KEY,
});

export const storage: StorageController = {
  setItem: (key, data) => instance.set(key, data),
  getItem: key => instance.getString(key) || null,
  removeItem: key => instance.delete(key),
};
