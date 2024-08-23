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

  get isBech32Enabled() {
    return Boolean(this.config?.bech32_exists);
  }

  get swapEnabled() {
    return Boolean(this.config?.swap_enabled);
  }
  get swapRouterV3() {
    return this.config?.swap_router_v3 ?? '';
  }
  get wethAddress() {
    return this.config?.weth_address ?? '';
  }

  get wethSymbol() {
    return this.config?.weth_symbol ?? '';
  }
}

const instance = new ProviderConfigStore();
export {instance as RemoteProviderConfig};
