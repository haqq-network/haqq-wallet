import {observable, runInAction} from 'mobx';

import {app} from '@app/contexts';
import {AddressUtils} from '@app/helpers/address-utils';
import {
  Backend,
  NetworkProvider,
  NetworkProviderResponse,
} from '@app/services/backend';
import {storage} from '@app/services/mmkv';
import {sleep} from '@app/utils';
import {DEFAULT_PROVIDERS, ISLM_DENOM} from '@app/variables/common';

import {ProviderID} from './provider.types';

import {VariablesString} from '../variables-string';

const HAQQ_BENCH_32_PREFIX = 'haqq';

const logger = Logger.create('NetworkProvider:store', {
  stringifyJson: true,
  emodjiPrefix: '🟡',
});
export class Provider {
  /****************************
   *  static Providers store  *
   ****************************/
  static MMKV_KEY = 'network-providers';
  static PROVIDER_REQUEST_TIMEOUT = 3000;
  static CACHED_VALUE: NetworkProviderResponse = JSON.parse(
    (storage.getItem(Provider.MMKV_KEY) as string) || '[]',
  );

  static data: Record<ProviderID, Provider> = observable(
    Provider.CACHED_VALUE.reduce(
      (prev, item) => ({
        ...prev,
        [item.id]: new Provider(item),
      }),
      {},
    ),
  );

  static init(): Promise<void> {
    return new Promise(async resolve => {
      let resolved = false;

      try {
        if (Provider.getAll().length) {
          resolved = true;
          resolve();
        }
        await this.fetchProviders();
      } catch (err) {
        logger.error('init', err);
        logger.captureException(err, 'init');
        await sleep(Provider.PROVIDER_REQUEST_TIMEOUT);
        return Provider.init();
      }

      if (!resolved) {
        resolve();
      }
    });
  }

  static async fetchProviders() {
    let providers = await Backend.instance.providers();
    if (!providers?.length) {
      providers = DEFAULT_PROVIDERS;
    }
    await storage.setItem(Provider.MMKV_KEY, JSON.stringify(providers));
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
        [item.id]: new Provider(item),
      }),
      {},
    );

    runInAction(() => {
      Provider.data = parsed;
    });
  }

  static getById(id: string) {
    return Provider.data[id];
  }
  static getAll() {
    return Object.values(Provider.data);
  }

  static create(id: string, item: NetworkProvider | Provider) {
    if (item instanceof Provider) {
      Provider.data[id] = item;
    } else {
      Provider.data[id] = new Provider(item);
    }
    return id;
  }

  static remove(id: string): boolean {
    if (Provider.data[id]) {
      delete Provider.data[id];
      return true;
    }
    return false;
  }
  static removeAll(): void {
    Provider.data = {};
  }

  static getAllIds(): string[] {
    return Object.keys(Provider.data);
  }

  static getByCosmosChainId(cosmosChainId: string) {
    return Object.values(Provider.data).find(
      provider => provider.model.cosmos_chain_id === cosmosChainId,
    );
  }

  static getByEthChainId(ethChainId: number | string) {
    if (!ethChainId || Number.isNaN(Number(ethChainId))) {
      return undefined;
    }
    return Object.values(Provider.data).find(
      provider => provider.model.chain_id === Number(ethChainId),
    );
  }

  static getByChainIdHex(ethChainIdHex: string) {
    if (!ethChainIdHex) {
      return undefined;
    }
    const ethChainId = parseInt(ethChainIdHex, 16);
    return Provider.getByEthChainId(ethChainId);
  }

  /****************************
   * single Provider instance *
   ****************************/
  #logger;

  constructor(public model: NetworkProvider) {
    this.#logger = Logger.create(`NetworkProvider:${model.name}`, {
      stringifyJson: true,
    });
  }

  get ethChainIdHex() {
    return '0x' + this.model.chain_id.toString(16);
  }

  get networkVersion() {
    const splitted = this.cosmosChainId.split('-');
    return splitted[1] ?? splitted.shift();
  }

  get id() {
    return this.model.id;
  }

  get name() {
    return this.model.name;
  }

  get icon() {
    return this.model.icon;
  }

  get ethRpcEndpoint() {
    return this.model.entry_point;
  }

  get ethChainId() {
    return this.model.chain_id;
  }

  get cosmosChainId() {
    if (!this.model.cosmos_chain_id) {
      return this.model.chain_id.toString();
    }
    return this.model.cosmos_chain_id;
  }

  get cosmosRestEndpoint() {
    return this.model.cosmos_entry_point;
  }

  get cosmosExplorer() {
    return this.model.cosmos_explorer_url;
  }

  get explorer() {
    return this.model.explorer_url;
  }

  get indexer() {
    return this.model.indexer_url;
  }

  get isEditable() {
    return app.isDeveloper ? true : false;
  }

  get decimals() {
    return this.model.decimals;
  }

  get weiDenom() {
    return this.model.wei_denom;
  }

  get denom() {
    return this.model.denom;
  }

  get isHaqqNetwork() {
    return this.model.denom.toLowerCase() === ISLM_DENOM.toLowerCase();
  }

  get bench32Prefix() {
    return HAQQ_BENCH_32_PREFIX;
  }

  toJSON() {
    return {
      ethChainIdHex: this.ethChainIdHex,
      networkVersion: this.networkVersion,
      ethRpcEndpoint: this.ethRpcEndpoint,
      ethChainId: this.ethChainId,
      cosmosChainId: this.cosmosChainId,
      cosmosRestEndpoint: this.cosmosRestEndpoint,
      explorer: this.explorer,
      indexer: this.indexer,
      isEditable: this.isEditable,
      ...this.model,
    };
  }

  getTxExplorerUrl(txHash: string) {
    if (!txHash) {
      return '';
    }

    if (txHash.startsWith('0x') || txHash.startsWith('0X')) {
      return `${this.explorer}/tx/${txHash}`;
    }

    return `${this.cosmosExplorer}/${this.bench32Prefix}/tx/${txHash}`;
  }

  getAddressExplorerUrl(address: string) {
    return `${this.explorer}/address/${AddressUtils.toEth(address)}`;
  }
}

export type ProviderKeys = keyof Omit<Provider, 'id'>;
