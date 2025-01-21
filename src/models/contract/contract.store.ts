import {makeAutoObservable, runInAction} from 'mobx';
import {makePersistable} from 'mobx-persist-store';

import {Indexer, IndexerAddressesResponse} from '@app/services/indexer';
import {storage} from '@app/services/mmkv';
import {ChainId} from '@app/types';

import {ContractStoreData, IndexerContract} from './contract.types';

import {ALL_NETWORKS_ID, Provider} from '../provider';

class Contract {
  _data: ContractStoreData = {};

  constructor(shouldSkipPersisting: boolean = false) {
    makeAutoObservable(this);
    if (!shouldSkipPersisting) {
      makePersistable(this, {
        name: this.constructor.name,
        properties: ['_data'],
        storage,
      });
    }
  }

  /**
   * Fetch contracts' information and store it into this._data
   *
   * @param contractAddresses Array of contract's addresses which shoul be fetched
   * @param chainId Chain id in which contracts will be fetched. If no chainId provided then contracts will be fetched for all chains
   */
  fetch = async (contractAddresses: string[], chainId?: ChainId) => {
    let contracts: IndexerAddressesResponse | null = null;

    if (!chainId) {
      const headers = Indexer.instance.getProvidersHeader(
        contractAddresses,
        Provider.getById(ALL_NETWORKS_ID),
      );
      contracts = await Indexer.instance.getAddresses(headers);
    } else {
      contracts = await Indexer.instance.getAddresses({
        [chainId]: contractAddresses,
      });
    }

    if (contracts) {
      runInAction(() => {
        this._data = Object.entries(contracts).reduce((acc, [cId, data]) => {
          const reducedContracts = data.reduce(
            (prev, contract) => ({
              ...prev,
              [contract.id]: contract,
            }),
            {} as Record<string, IndexerContract>,
          );

          return {
            ...this._data,
            ...acc,
            [cId]: {
              ...this._data[cId],
              ...reducedContracts,
            },
          };
        }, {} as ContractStoreData);
      });
    }
  };

  /**
   * Fetch contract information and update this._data with it
   *
   * @param contractAddress Contract's address which shoul be fetched
   * @param chainId Chain id in which contracts will be fetched. If no chainId provided then contracts will be fetched for all chains
   * @returns Contract for {contractAddress}
   */
  getById = async (
    contractAddress: string,
    chainId?: ChainId,
  ): Promise<IndexerContract | null> => {
    let contract: IndexerContract | null = null;

    if (!chainId) {
      // Check already fetched contracts
      const fetchedContractFlatMap = Object.entries(this._data).flatMap(
        ([_, v]) => Object.entries(v).flatMap(([__, c]) => c),
      );
      contract = fetchedContractFlatMap?.find(t => t.name) ?? null;

      // If fetched contract doesn't exists than fetch and find contract from all chains
      if (!contract) {
        const headers = Indexer.instance.getProvidersHeader(
          [contractAddress],
          Provider.getById(ALL_NETWORKS_ID),
        );
        const contracts = await Indexer.instance.getAddresses(headers);
        const contractFlatMap = Object.entries(contracts).flatMap(
          ([_, v]) => v,
        );
        contract = contractFlatMap?.find(t => t.name) ?? null;
      }
    } else {
      contract = this._data[chainId][contractAddress] ?? null;
      if (!contract) {
        await this.fetch([contractAddress], chainId);
        contract = this._data[chainId][contractAddress] ?? null;
      }
    }

    return contract;
  };
}

const instance = new Contract(Boolean(process.env.JEST_WORKER_ID));
export {instance as Contract};
