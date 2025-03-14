import {makePersistable} from '@override/mobx-persist-store';
import {makeAutoObservable, runInAction} from 'mobx';

import {Events} from '@app/events';
import {hideModal, showModal} from '@app/helpers';
import {awaitForEventDone} from '@app/helpers/await-for-event-done';
import {EthRpcEndpointAvailability} from '@app/helpers/eth-rpc-endpoint-availability';
import {Backend, NetworkProvider} from '@app/services/backend';
import {storage} from '@app/services/mmkv';
import {WalletConnect} from '@app/services/wallet-connect';
import {ModalType} from '@app/types';
import {createAsyncTask} from '@app/utils';
import {DEFAULT_PROVIDERS} from '@app/variables/common';

import {RemoteProviderConfig} from './provider-config';
import {ProviderModel} from './provider.model';
import {
  ALL_NETWORKS_ID,
  ALL_NETWORKS_PROVIDER,
  ProviderID,
} from './provider.types';

import {AppStore} from '../app';
import {Currencies} from '../currencies';
import {Nft} from '../nft';
import {Stories} from '../stories';
import {Token} from '../tokens';
import {Transaction} from '../transaction';
import {Wallet} from '../wallet';
import {WalletConnectSessionMetadata} from '../wallet-connect-session-metadata';

type SelectProviderOptions = {
  requestMarkup: boolean;
};

const logger = Logger.create('NetworkProvider:store', {
  stringifyJson: true,
  emodjiPrefix: '🟡',
});
class ProviderStore {
  awaitForInitialization() {
    throw new Error('Method not implemented.');
  }
  private _defaultProviderId = DEFAULT_PROVIDERS.find(
    it => it.stage === 'mainnet',
  )?.id!;

  _selectedProviderId: ProviderID = this._defaultProviderId;
  _data: Record<ProviderID, ProviderModel> = {};

  constructor() {
    makeAutoObservable(this);
    makePersistable(this, {
      name: this.constructor.name,
      properties: ['_selectedProviderId'],
      storage,
    });
    this.fetchProviders();
  }

  get selectedProviderId() {
    return this._selectedProviderId;
  }

  get selectedProvider() {
    return this._data[this._selectedProviderId];
  }

  get defaultProviderId() {
    return this._defaultProviderId;
  }

  get defaultProvider() {
    return this._data[this._defaultProviderId];
  }

  get isAllNetworks() {
    return this._selectedProviderId === ALL_NETWORKS_ID;
  }

  setSelectedProviderId = async (
    id: ProviderID,
    {requestMarkup}: SelectProviderOptions = {requestMarkup: true},
  ) => {
    runInAction(() => {
      this._selectedProviderId = id;
    });
    try {
      showModal(ModalType.loading);

      Nft.clear();
      Token.clear();
      Transaction.removeAll();
      Currencies.clear();

      await RemoteProviderConfig.init();
      // for all networks we need for await
      if (id === ALL_NETWORKS_ID) {
        await Wallet.fetchBalances(undefined, true);
      } else {
        // for others chains no need await for fastest change
        Wallet.fetchBalances(undefined, true);
      }
      if (requestMarkup) {
        await awaitForEventDone(Events.onRequestMarkup);
      }
      Token.fetchTokens(true);
      await Currencies.fetchCurrencies();

      if (this.isAllNetworks || this.selectedProvider.config.isNftEnabled) {
        Nft.fetchNft();
      }
      this.fetchProviders();

      await this.awaitForInitialization();
      for (let session of WalletConnectSessionMetadata.getAll()) {
        await WalletConnect.instance.emitChainChange(
          this.selectedProvider.ethChainId,
          session.topic,
        );
      }
    } finally {
      Transaction.fetchLatestTransactions(Wallet.addressList(), true);
      hideModal(ModalType.loading);
    }

    await Promise.allSettled([
      Currencies.setSelectedCurrency(),
      awaitForEventDone(
        Events.onTesterModeChanged,
        AppStore.isTesterModeEnabled,
      ),
      EthRpcEndpointAvailability.checkEthRpcEndpointAvailability(),
      Stories.fetch(true),
    ]);
  };

  init = async (): Promise<void> => {
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
      }

      if (!resolved) {
        resolve();
      }
    });
  };

  fetchProviders = createAsyncTask(async () => {
    if (AppStore.isRpcOnly) {
      const parsed = DEFAULT_PROVIDERS.reduce(
        (prev, item) => ({
          ...prev,
          [item.id]: new ProviderModel(item),
        }),
        {} as Record<ProviderID, ProviderModel>,
      );
      runInAction(() => {
        this._data = parsed;
        if (!parsed[this._selectedProviderId]) {
          this._selectedProviderId = this._defaultProviderId;
        }
      });
    } else {
      const providers = [ALL_NETWORKS_PROVIDER];
      const remoteProviders = await Backend.instance.providers();

      if (remoteProviders?.length) {
        providers.push(...remoteProviders);
      } else {
        providers.push(...DEFAULT_PROVIDERS);
      }

      const parsed = providers.reduce(
        (prev, item) => ({
          ...prev,
          [item.id]: new ProviderModel(item),
        }),
        {} as Record<ProviderID, ProviderModel>,
      );

      runInAction(() => {
        this._data = parsed;
        if (!parsed[this._selectedProviderId]) {
          this._selectedProviderId = this._defaultProviderId;
        }
      });
    }
  });

  getById(id: string) {
    return this._data[id];
  }
  getAll() {
    return Object.values(this._data);
  }

  getAllNetworks() {
    return Object.values(this._data).filter(p => {
      if (
        AppStore.isAdditionalFeaturesEnabled &&
        AppStore.testnetsEnabledForAllNetworks
      ) {
        return p.id !== ALL_NETWORKS_ID;
      }
      // disable testnet chains for non-dev mode
      return p.id !== ALL_NETWORKS_ID && p.isMainnet;
    });
  }

  getAllEVM() {
    return Object.values(this._data).filter(
      p => !p.isTron && p.id !== ALL_NETWORKS_ID,
    );
  }

  create(id: string, item: NetworkProvider | ProviderModel) {
    if (item instanceof ProviderModel) {
      this._data[id] = item;
    } else {
      this._data[id] = new ProviderModel(item);
    }
    return id;
  }

  remove(id: string): boolean {
    if (this._data[id]) {
      delete this._data[id];
      return true;
    }
    return false;
  }
  removeAll(): void {
    this._data = {};
  }

  getAllIds(): string[] {
    return Object.keys(this._data);
  }

  getByCosmosChainId(cosmosChainId: string) {
    return Object.values(this._data).find(
      provider => provider.model.cosmos_chain_id === cosmosChainId,
    );
  }

  getByEthChainId(ethChainId: number | string) {
    if (!ethChainId || Number.isNaN(Number(ethChainId))) {
      return undefined;
    }
    return Object.values(this._data).find(
      provider => provider?.model?.chain_id === Number(ethChainId),
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
