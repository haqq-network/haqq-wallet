import {StorageInterface} from '@app/services/provider-mpc';

export class StorageMock implements StorageInterface {
  getItem(_key: string) {
    return Promise.resolve('');
  }

  setItem(_key: string, _value: string) {
    return Promise.resolve(false);
  }

  hasItem(_key: string) {
    return Promise.resolve(false);
  }
}
