import {makePersistable} from '@override/mobx-persist-store';
import {makeAutoObservable, runInAction} from 'mobx';

import {AddressUtils} from '@app/helpers/address-utils';
import {getUid} from '@app/helpers/get-uid';
import {Provider} from '@app/models/provider';
import {storage} from '@app/services/mmkv';
import {DEFAULT_PROVIDERS} from '@app/variables/common';

import {EventTracker} from '../event-tracker';

export interface TransactionRpc {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  nonce: string;
  blockHash: string;
  transactionIndex: string;
  from: string;
  to: string;
  value: string;
  gas: string;
  gasPrice: string;
  isError: string;
  txreceipt_status: string;
  input: string;
  contractAddress: string;
  cumulativeGasUsed: string;
  gasUsed: string;
  confirmations: string;
  forWallet: string[];
}

interface TransactionRpcResponse {
  status: string;
  message: string;
  result: TransactionRpc[];
}

export interface TransactionRpcResult {
  get: (wallet: string) => TransactionRpc[];
  getAll: () => TransactionRpc[];
  page: number;
}

type TransactionRpcCache = Record<string, Record<number, TransactionRpc[]>>;

export class TransactionRpcStore {
  public static instance: TransactionRpcStore;

  addresses: string[] = [];
  currentPage: number = 1;
  offset: number = 10;
  explorerUrl: string = 'https://explorer.haqq.network';

  cache: TransactionRpcCache = {};

  private constructor(addresses: string[] = [], offset: number = 10) {
    makeAutoObservable(this);

    this.offset = offset;
    this.addresses = addresses;

    runInAction(() => {
      let newCache: TransactionRpcCache = {};
      for (const addr of this.addresses) {
        newCache[addr] = {};
      }
      this.cache = {...this.cache, ...newCache};
    });

    makePersistable(this, {
      name: this.constructor.name,
      properties: ['cache', 'currentPage', 'addresses'],
      storage,
    });
  }

  public static getInstance(
    addresses: string[] = [],
    offset: number = 25,
  ): TransactionRpcStore {
    if (!TransactionRpcStore.instance) {
      TransactionRpcStore.instance = new TransactionRpcStore(addresses, offset);
    } else {
      TransactionRpcStore.instance.updateAddress(addresses, offset);
    }
    return TransactionRpcStore.instance;
  }

  private async fetchTransactionsFromAPI(
    address: string,
    page: number,
  ): Promise<TransactionRpc[]> {
    const REST_URL = DEFAULT_PROVIDERS.find(
      it => it.id === Provider.selectedProvider.id,
    )?.explorer_url;

    const url = `${REST_URL}/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=${page}&offset=${this.offset}&sort=desc`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'haqq-user-id': await EventTracker.instance.getAdid('posthog'),
        'haqq-app-id': await getUid(),
      },
    });
    if (!response.ok) {
      throw new Error(
        `HTTP error for ${address} on page ${page}: ${response.status}`,
      );
    }
    const data: TransactionRpcResponse = await response.json();
    if (data.status !== '1') {
      if (data.message.toLowerCase().includes('No transactions found')) {
        return [];
      }
      throw new Error(`API error for ${address}: ${data.message}`);
    }
    return data.result.map(tx => ({...tx, forWallet: [address]}));
  }

  public async getPage(page: number): Promise<TransactionRpcResult> {
    try {
      Logger.log('Fetching transactions for page', page, this.addresses);

      if (page < 1) {
        throw new Error('Number of page must be greater than 0');
      }

      await Promise.all(
        this.addresses.map(async address => {
          const addrCache = this.cache[address] || {};
          if (!this.cache[address]) {
            runInAction(() => {
              this.cache = {
                ...this.cache,
                [address]: {...addrCache},
              };
            });
          }

          if (!addrCache[page]) {
            const txs = await this.fetchTransactionsFromAPI(address, page);
            runInAction(() => {
              this.cache = {
                ...this.cache,
                [address]: {
                  ...this.cache[address],
                  [page]: txs,
                },
              };
            });
          }
        }),
      );

      runInAction(() => {
        this.currentPage = page;
      });

      return this.createTransactionResult(page);
    } catch (e) {
      Logger.error('Error fetching transactions', e);
      return {
        get: () => [],
        getAll: () => [],
        page: this.currentPage,
      };
    }
  }

  public async nextPage(): Promise<TransactionRpcResult> {
    const nextPage = this.currentPage + 1;
    const result = await this.getPage(nextPage);

    const allEmpty = this.addresses.every(
      address => result.get(address).length === 0,
    );
    if (allEmpty) {
      return {
        get: () => [],
        getAll: () => [],
        page: this.currentPage,
      };
    }
    return result;
  }

  public async previousPage(): Promise<TransactionRpcResult> {
    const prevPage = this.currentPage - 1;
    if (prevPage < 1) {
      throw new Error('No previous page');
    }
    return this.getPage(prevPage);
  }

  public reset(): void {
    runInAction(() => {
      this.currentPage = 1;
      this.cache = {};
    });
  }

  public addWallet(wallet: string): void {
    if (!this.addresses.includes(wallet)) {
      runInAction(() => {
        this.addresses = [...new Set([...this.addresses, wallet])];

        if (!this.cache[wallet]) {
          this.cache = {
            ...this.cache,
            [wallet]: {},
          };
        }
      });
    }
  }

  public removeWallet(wallet: string): void {
    runInAction(() => {
      this.addresses = this.addresses.filter(
        addr => !AddressUtils.equals(addr, wallet),
      );
      delete this.cache[wallet];
    });
  }

  public updateAddress(addresses: string[], offset = 10): void {
    const addressesAreEqual =
      this.addresses.length === addresses.length &&
      this.addresses.every((addr, i) =>
        AddressUtils.equals(addr, addresses[i]),
      );

    if (addressesAreEqual) {
      return;
    }

    runInAction(() => {
      this.addresses = [...new Set(addresses)];
      this.offset = offset;
      this.currentPage = 1;

      let newCache: TransactionRpcCache = {...this.cache};
      for (const addr of this.addresses) {
        if (!newCache[addr]) {
          newCache[addr] = {};
        }
      }
      this.cache = newCache;
    });
  }

  private createTransactionResult(page: number): TransactionRpcResult {
    const walletTxs: Record<string, TransactionRpc[]> = {};

    for (const address of this.addresses) {
      walletTxs[address] = this.cache[address]?.[page] || [];
    }

    return {
      page,
      get: (wallet: string) => walletTxs[wallet] || [],
      getAll: () => {
        const merged: {[hash: string]: TransactionRpc} = {};

        for (const wallet of this.addresses) {
          for (const tx of walletTxs[wallet]) {
            if (merged[tx.hash]) {
              const existing = merged[tx.hash];
              tx.forWallet.forEach(w => {
                if (!existing.forWallet.includes(w)) {
                  existing.forWallet.push(w);
                }
              });
            } else {
              merged[tx.hash] = {...tx, forWallet: [...tx.forWallet]};
            }
          }
        }

        return Object.values(merged);
      },
    };
  }
}
