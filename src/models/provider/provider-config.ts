import {makeAutoObservable, runInAction} from 'mobx';
import {makePersistable} from 'mobx-persist-store';

import {app} from '@app/contexts';
import {Indexer} from '@app/services/indexer';
import {ProviderConfig} from '@app/services/indexer/indexer.types';
import {storage} from '@app/services/mmkv';
import {ChainId} from '@app/types';

import {Provider} from './provider';
import {ProviderConfigModel} from './provider-config.model';
import {ALL_NETWORKS_ID} from './provider.types';

class ProviderConfigStore {
  private _data: Record<ChainId, ProviderConfig> = {};

  constructor() {
    makeAutoObservable(this);
    makePersistable(this, {
      name: this.constructor.name,
      properties: ['_data'] as (keyof this)[],
      storage: storage,
    });
  }

  init = async () => {
    try {
      if (app.provider.id !== ALL_NETWORKS_ID) {
        const config = await Indexer.instance.getProviderConfig();
        runInAction(() => {
          this._data[app.provider.ethChainId] = config;
        });
      }
      this.lazyLoadOtherConfig();
      return Promise.resolve();
    } catch (error) {
      Logger.captureException(error, 'ProviderConfigStore:init');
    }
  };

  get data() {
    return this._data;
  }

  lazyLoadOtherConfig = async () => {
    const providers = Provider.getAll().filter(
      p => p.ethChainId !== app.provider.ethChainId && p.id !== ALL_NETWORKS_ID,
    );

    for await (const p of providers) {
      try {
        if (this._data[p.ethChainId]) {
          continue;
        }
        const indexer = new Indexer(p.ethChainId);
        const c = await indexer.getProviderConfig();
        runInAction(() => {
          this._data[p.ethChainId] = c;
        });
      } catch (error) {
        Logger.captureException(error, 'failed to initialize provider config:');
      }
    }
  };

  getConfig = (chainId: ChainId) => {
    return new ProviderConfigModel(this.data[chainId]);
  };
}

const instance = new ProviderConfigStore();
export {instance as RemoteProviderConfig};
