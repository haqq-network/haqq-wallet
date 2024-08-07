import {makeAutoObservable, runInAction} from 'mobx';

import {Indexer} from '@app/services/indexer';
import {ProviderConfig} from '@app/services/indexer/indexer.types';

class ProviderConfigStore {
  config: ProviderConfig | null = null;
  constructor() {
    makeAutoObservable(this);
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
