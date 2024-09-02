import {makeAutoObservable, runInAction} from 'mobx';
import {makePersistable} from 'mobx-persist-store';

import {
  Backend,
  NetworkProvider,
  NetworkProviderStage,
  NetworkProviderStatus,
  NetworkProviderTypes,
} from '@app/services/backend';
import {storage} from '@app/services/mmkv';
import {createAsyncTask, sleep} from '@app/utils';
import {
  DEFAULT_PROVIDERS,
  STORE_REHYDRATION_TIMEOUT_MS,
} from '@app/variables/common';

import {ProviderModel} from './provider.model';
import {ProviderID} from './provider.types';

import {VariablesString} from '../variables-string';

const logger = Logger.create('NetworkProvider:store', {
  stringifyJson: true,
  emodjiPrefix: '🟡',
});
class ProviderStore {
  data: Record<ProviderID, ProviderModel> = {};

  constructor() {
    makeAutoObservable(this);
    makePersistable(this, {
      name: this.constructor.name,
      properties: ['data'],
      storage: storage,
    });
  }

  init(): Promise<void> {
    return new Promise(async resolve => {
      let resolved = false;

      try {
        if (this.getAll().length) {
          resolved = true;
          resolve();
        }
        await this.fetchProviders();
      } catch (err) {
        logger.error('init', err);
        logger.captureException(err, 'init');
        await sleep(STORE_REHYDRATION_TIMEOUT_MS);
        return this.init();
      }

      if (!resolved) {
        resolve();
      }
    });
  }

  fetchProviders = createAsyncTask(async () => {
    const providers = [
      {
        id: 'all_networks',
        name: 'All Networks',
        icon: '',
        chain_id: -1,
        coin_name: 'All Network',
        cosmos_chain_id: undefined,
        cosmos_entry_point: undefined,
        cosmos_explorer_url: undefined,
        decimals: 0,
        denom: '',
        entry_point: 'https://rpc.eth.haqq.network/',
        explorer_url: undefined,
        indexer_url: 'https://proxy.indexer.haqq.network',
        network_type: NetworkProviderTypes.EVM,
        stage: NetworkProviderStage.MAINNET,
        status: NetworkProviderStatus.PUBLISHED,
        wei_denom: '',
      } as NetworkProvider,
    ];
    const remoteProviders = await Backend.instance.providers();

    if (remoteProviders?.length) {
      providers.push(...remoteProviders);
    } else {
      providers.push(...DEFAULT_PROVIDERS);
    }

    const providerId = VariablesString.get('providerId');

    if (
      providerId &&
      !providers.some(
        item => item.id.toLowerCase() === providerId.toLowerCase(),
      )
    ) {
      VariablesString.remove('providerId');
    }

    const parsed = providers.reduce(
      (prev, item) => ({
        ...prev,
        [item.id]: new ProviderModel(item),
      }),
      {},
    );

    runInAction(() => {
      this.data = parsed;
    });
  });

  getById(id: string) {
    return this.data[id];
  }
  getAll() {
    return Object.values(this.data);
  }

  create(id: string, item: NetworkProvider | ProviderModel) {
    if (item instanceof ProviderModel) {
      this.data[id] = item;
    } else {
      this.data[id] = new ProviderModel(item);
    }
    return id;
  }

  remove(id: string): boolean {
    if (this.data[id]) {
      delete this.data[id];
      return true;
    }
    return false;
  }
  removeAll(): void {
    this.data = {};
  }

  getAllIds(): string[] {
    return Object.keys(this.data);
  }

  getByCosmosChainId(cosmosChainId: string) {
    return Object.values(this.data).find(
      provider => provider.model.cosmos_chain_id === cosmosChainId,
    );
  }

  getByEthChainId(ethChainId: number | string) {
    if (!ethChainId || Number.isNaN(Number(ethChainId))) {
      return undefined;
    }
    return Object.values(this.data).find(
      provider => provider.model.chain_id === Number(ethChainId),
    );
  }

  getByChainIdHex(ethChainIdHex: string) {
    if (!ethChainIdHex) {
      return undefined;
    }
    const ethChainId = parseInt(ethChainIdHex, 16);
    return this.getByEthChainId(ethChainId);
  }
}

const instance = new ProviderStore();
export {instance as Provider};
