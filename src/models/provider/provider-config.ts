import {makePersistable} from '@override/mobx-persist-store';
import {hoursToMilliseconds} from 'date-fns';
import {makeAutoObservable, runInAction} from 'mobx';

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
      expireIn: hoursToMilliseconds(24),
      // FIXME: configurePersistable didn't define yet there because of circular dependencies issue
      storage,
    });
  }

  init = async () => {
    try {
      if (Provider.selectedProviderId !== ALL_NETWORKS_ID) {
        const config = await Indexer.instance.getProviderConfig();
        runInAction(() => {
          this._data[Provider.selectedProvider.ethChainId] = config;
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
      p =>
        p.ethChainId !== Provider.selectedProvider.ethChainId &&
        p.id !== ALL_NETWORKS_ID,
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
    const data = this.data[chainId];
    if (!data) {
      this.lazyLoadOtherConfig();
    }
    return new ProviderConfigModel(data || {});
  };
}

const instance = new ProviderConfigStore();
export {instance as RemoteProviderConfig};
