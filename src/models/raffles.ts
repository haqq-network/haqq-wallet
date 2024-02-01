import {makeAutoObservable, toJS} from 'mobx';
import {makePersistable} from 'mobx-persist-store';

import {storage} from '@app/services/mmkv';
import {MobXStore, Raffle} from '@app/types';

class RafflesStore implements MobXStore<Raffle> {
  constructor(shouldSkipPersisting: boolean = false) {
    makeAutoObservable(this);
    if (!shouldSkipPersisting) {
      makePersistable(this, {
        name: this.constructor.name,
        // @ts-ignore
        properties: ['_data'],
        storage: storage,
      });
    }
  }

  private _data: Record<string, Raffle> = {};

  get data() {
    return toJS(this._data);
  }

  create(id: string, params: Raffle) {
    const _id = id.toLowerCase();
    const existingData = this.getById(_id);
    const newData = {
      ...existingData,
      ...params,
      id: _id,
    };
    if (existingData) {
      this.update(existingData.id, params);
    } else {
      this._data[_id] = newData;
    }
    return id;
  }

  remove(id: string) {
    if (!id) {
      return false;
    }
    const dataToRemove = this.getById(id);
    if (!dataToRemove) {
      return false;
    }
    delete this._data[id];
    return true;
  }

  getAll() {
    return Object.values(this.data);
  }

  getById(id: string) {
    return this.data[id.toLowerCase()];
  }

  removeAll() {
    this._data = {};
  }

  update(id: string | undefined, params: Partial<Raffle>) {
    if (!id) {
      return false;
    }
    const dataToUpdate = this.getById(id);
    if (!dataToUpdate) {
      return false;
    }
    this._data[id] = {
      ...dataToUpdate,
      ...params,
    };
    return true;
  }
}

export const Raffles = new RafflesStore();
