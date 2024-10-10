import {makeAutoObservable} from 'mobx';
import {makePersistable} from 'mobx-persist-store';

import {AddressUtils, NATIVE_TOKEN_ADDRESS} from '@app/helpers/address-utils';
import {Whitelist} from '@app/helpers/whitelist';
import {storage} from '@app/services/mmkv';
import {IContract, IToken, MobXStore} from '@app/types';

import {Provider} from './provider';
import {Token} from './tokens';

/**
 * @deprecated use Token store instead
 */
class ContractsStore implements MobXStore<IContract> {
  /**
   * User's contracts
   * @key Contract address
   * @value IContract
   */
  data: Record<string, IContract> = {};
  private _fetchInProgressMap: Record<string, boolean> = {};

  constructor(shouldSkipPersisting: boolean = false) {
    makeAutoObservable(this);
    if (!shouldSkipPersisting) {
      makePersistable(this, {
        name: this.constructor.name,
        properties: ['data'],
        storage: storage,
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
        [AddressUtils.toHaqq(id)]: newItem,
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
    delete newData[AddressUtils.toHaqq(id)];

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
    if (AddressUtils.equals(id, NATIVE_TOKEN_ADDRESS)) {
      return Token.generateNativeTokenContracts()[0];
    }
    let result = this.data[AddressUtils.toHaqq(id)];

    if (!result) {
      this._fetchContractData(id);
    }

    if ('address' in result && typeof result.address === 'object') {
      result = (result.address as any)[Provider.selectedProvider.ethChainId];
    }

    return result;
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
      [AddressUtils.toHaqq(id)]: {
        ...itemToUpdate,
        ...item,
      },
    };
    return true;
  }

  private async _fetchContractData(address: string) {
    try {
      const isFetching = this._fetchInProgressMap[address];
      if (isFetching || !AddressUtils.isValidAddress(address)) {
        return;
      }
      this._fetchInProgressMap[address] = true;
      const haqqAddress = AddressUtils.toHaqq(address);
      const data = await Whitelist.verifyAddress(haqqAddress);

      if (!data) {
        return;
      }

      this.create(haqqAddress, data);
    } catch (err) {
    } finally {
      this._fetchInProgressMap[address] = false;
    }
  }
}

/**
 * @deprecated use Token store instead
 */
const instance = new ContractsStore(Boolean(process.env.JEST_WORKER_ID));
export {instance as Contracts};
