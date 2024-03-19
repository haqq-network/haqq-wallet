import {StorageController} from 'mobx-persist-store';
import Config from 'react-native-config';
import {MMKV} from 'react-native-mmkv';

const instance = new MMKV({
  id: 'mmkv-storage',
  encryptionKey: Config.MMKV_KEY,
});

export const storage: StorageController = {
  setItem: (key, data) => instance.set(key, data),
  getItem: key => instance.getString(key) || null,
  removeItem: key => instance.delete(key),
};
