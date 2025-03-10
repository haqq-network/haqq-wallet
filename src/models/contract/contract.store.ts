import {makeAutoObservable, runInAction} from 'mobx';
import {makePersistable} from 'mobx-persist-store';

import {AddressUtils} from '@app/helpers/address-utils';
import {Indexer, IndexerAddressesResponse} from '@app/services/indexer';
import {storage} from '@app/services/mmkv';
import {fetchIndexerContract} from '@app/services/rpc/evm-contract';
import {AddressEthereum, AddressWallet, ChainId} from '@app/types';

import {ContractStoreData, IndexerContract} from './contract.types';

import {AppStore} from '../app';
import {ALL_NETWORKS_ID, Provider} from '../provider';

class Contract {
  _data: ContractStoreData = {};

  private _searchContract = (contractAddress: AddressEthereum) => {
    const fetchedContractFlatMap = Object.entries(this._data).flatMap(
      ([_, v]) => Object.entries(v).flatMap(([__, c]) => c),
    );
    return (
      fetchedContractFlatMap?.find(t =>
        AddressUtils.equals(t.id, contractAddress),
      ) ?? null
    );
  };

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
  fetch = async (
    contractAddresses: string[],
    chainId?: ChainId,
  ): Promise<IndexerAddressesResponse> => {
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

    return contracts;
  };

  /**
   * Fetch contract information and update this._data with it
   *
   * @param contractAddress Contract's address which shoul be fetched
   * @param chainId Chain id in which contracts will be fetched. If no chainId provided then contracts will be fetched for all chains
   * @returns Contract for {contractAddress}
   */
  getById = async (
    contractAddress: AddressWallet,
    chainId?: ChainId,
  ): Promise<IndexerContract | null> => {
    // Check already fetched contracts
    const contractId = AddressUtils.toEth(contractAddress);
    let contract = this._searchContract(contractId);

    if (!contract) {
      if (!chainId) {
        // If fetched contract doesn't exists than fetch and find contract from all chains
        const headers = Indexer.instance.getProvidersHeader(
          [contractId],
          Provider.getById(ALL_NETWORKS_ID),
        );
        const contracts = await Indexer.instance.getAddresses(headers);
        const contractFlatMap = Object.entries(contracts).flatMap(
          ([_, v]) => v,
        );
        contract = contractFlatMap?.find(t => t.name) ?? null;
      } else {
        const fetchedContracts = await this.fetch([contractId], chainId);
        contract =
          (fetchedContracts[chainId] ?? []).find(c =>
            AddressUtils.equals(c.id, contractId),
          ) ?? null;
      }
    }

    if (!contract && AppStore.isRpcOnly) {
      return fetchIndexerContract(AddressUtils.toEth(contractAddress));
    }

    return contract;
  };
}

const instance = new Contract(Boolean(process.env.JEST_WORKER_ID));
export {instance as Contract};
