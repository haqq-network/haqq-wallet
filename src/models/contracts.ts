import {makeAutoObservable} from 'mobx';
import {makePersistable} from 'mobx-persist-store';

import {storage} from '@app/services/mmkv';
import {IContract, IToken, MobXStore} from '@app/types';

class ContractsStore implements MobXStore<IContract> {
  /**
   * User's contracts
   * @key Contract address
   * @value IContract
   */
  data: Record<string, IContract> = {};

  constructor(shouldSkipPersisting: boolean = false) {
    makeAutoObservable(this);
    if (!shouldSkipPersisting) {
      makePersistable(this, {
        name: this.constructor.name,
        properties: ['data'],
        storage: storage,
      }).then(() => {
        Logger.log('ContractsStore data', JSON.stringify(this.data, null, 2));
      });
    }
  }

  create(id: string, params: IContract) {
    const existingItem = this.getById(params.id);
    const newItem = {
      ...existingItem,
      ...params,
    };

    if (existingItem) {
      this.update(existingItem.id, params);
    } else {
      this.data = {
        ...this.data,
        [id]: newItem,
      };
    }

    return id;
  }

  remove(id: string | undefined) {
    if (!id) {
      return false;
    }
    const bannerToRemove = this.getById(id);
    if (!bannerToRemove) {
      return false;
    }
    const newData = {
      ...this.data,
    };
    delete newData[id];

    this.data = newData;
    return true;
  }

  removeAll() {
    this.data = {};
  }

  getAll() {
    return Object.values(this.data);
  }

  getAllVisible() {
    return Object.values(this.data).filter(item => !!item.is_in_white_list);
  }

  getById(id: string) {
    return this.data[id];
  }

  update(id: string | undefined, item: Omit<Partial<IToken>, 'id'>) {
    if (!id) {
      return false;
    }
    const itemToUpdate = this.getById(id);
    if (!itemToUpdate) {
      return false;
    }

    this.data = {
      ...this.data,
      [id]: {
        ...itemToUpdate,
        ...item,
      },
    };
    return true;
  }
}

const instance = new ContractsStore(Boolean(process.env.JEST_WORKER_ID));
export {instance as Contracts};
