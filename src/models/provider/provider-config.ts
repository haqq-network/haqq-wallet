import {makeAutoObservable, runInAction} from 'mobx';
import {makePersistable} from 'mobx-persist-store';

import {Indexer} from '@app/services/indexer';
import {ProviderConfig} from '@app/services/indexer/indexer.types';
import {storage} from '@app/services/mmkv';

class ProviderConfigStore {
  config: ProviderConfig | null = null;
  constructor() {
    makeAutoObservable(this);
    makePersistable(this, {
      name: this.constructor.name,
      properties: ['config'],
      storage: storage,
    });
  }

  init = async () => {
    const newConfig = await Indexer.instance.getProviderConfig();
    runInAction(() => {
      this.config = newConfig;
    });
  };

  get isNftEnabled() {
    return Boolean(this.config?.nft_exists);
  }
}

const instance = new ProviderConfigStore();
export {instance as RemoteProviderConfig};
