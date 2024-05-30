import {
  JSONRPCError,
  jsonrpcRequest,
} from '@haqq/shared-react-native/src/jsonrpc-request';
import _ from 'lodash';

import {app} from '@app/contexts';
import {AddressUtils} from '@app/helpers/address-utils';
import {Whitelist} from '@app/helpers/whitelist';
import {I18N, getText} from '@app/i18n';
import {NftCollectionIndexer} from '@app/models/nft';
import {Provider} from '@app/models/provider';
import {
  ContractNameMap,
  IContract,
  IndexerBalance,
  IndexerTime,
  IndexerToken,
  IndexerTransaction,
  IndexerTransactionResponse,
  RatesResponse,
} from '@app/types';

import {
  SushiPoolEstimateRequest,
  SushiPoolEstimateResponse,
  SushiPoolResponse,
} from './indexer.types';

import {RemoteConfig} from '../remote-config';

export type IndexerUpdatesResponse = {
  addresses: IContract[];
  balance: IndexerBalance;
  staked: IndexerBalance;
  vested: IndexerBalance;
  available: IndexerBalance;
  locked: IndexerBalance;
  total: IndexerBalance;
  available_for_stake: IndexerBalance;
  // next time for unlock vested tokens
  unlock: IndexerTime;
  last_update: string;
  // TODO: add types
  nfts: unknown[];
  tokens: IndexerToken[];
  transactions: unknown[];
  rates: RatesResponse;
};

const logger = Logger.create('IndexerService');

export class Indexer {
  static instance = new Indexer();

  static headers = {
    accept: 'application/json, text/plain, */*',
    'accept-language': 'en-US,en;q=0.9,ru;q=0.8',
    connection: 'keep-alive',
    'content-type': 'application/json;charset=UTF-8',
  };

  captureException = logger.captureException;

  constructor() {
    this.init();
  }

  async init() {
    await RemoteConfig.awaitForInitialization();
    this.captureException = _.throttle(
      logger.captureException,
      RemoteConfig.safeGet('indexer_sentry_capture_exeption_throttle_ms'),
      {
        leading: true,
      },
    );
  }

  async updates(
    accounts: string[],
    lastUpdated: Date | undefined,
    selectedCurrency?: string,
  ): Promise<IndexerUpdatesResponse> {
    try {
      if (!app.provider.indexer) {
        throw new Error('Indexer is not configured');
      }

      const updated = lastUpdated || new Date(0);

      const result: IndexerUpdatesResponse = await jsonrpcRequest(
        app.provider.indexer,
        'updates',
        [accounts, updated, selectedCurrency].filter(Boolean),
      );

      return result;
    } catch (err) {
      if (err instanceof JSONRPCError) {
        this.captureException(err, 'Indexer:updates', err.meta);
      }
      throw err;
    }
  }

  async getContractName(address: string): Promise<string> {
    const info = await Whitelist.verifyAddress(address);
    return info?.name ?? getText(I18N.transactionContractDefaultName);
  }

  async getContractNames(addresses: string[]): Promise<ContractNameMap> {
    try {
      if (!app.provider.indexer) {
        throw new Error('Indexer is not configured');
      }

      if (addresses.length === 0) {
        return Promise.reject('Empty addresses');
      }

      const response = await jsonrpcRequest<
        {name: string; id: string; symbol: string}[]
      >(app.provider.indexer, 'addresses', [
        addresses.map(AddressUtils.toHaqq),
      ]);

      const map = addresses.reduce((acc, item) => {
        const responseExist = Array.isArray(response) && response.length > 0;
        const newValue = responseExist
          ? response.find(infoItem => infoItem.id === AddressUtils.toHaqq(item))
          : null;

        acc[item] = {
          name: newValue?.name ?? getText(I18N.transactionContractDefaultName),
          symbol: newValue?.symbol || '',
        };
        return acc;
      }, {} as ContractNameMap);

      return map;
    } catch (err) {
      if (err instanceof JSONRPCError) {
        this.captureException(err, 'Indexer:getContractNames', err.meta);
      }
      throw err;
    }
  }

  async getBalances(accounts: string[]): Promise<Record<string, string>> {
    try {
      if (!app.provider.indexer) {
        throw new Error('Indexer is not configured');
      }

      const response = await jsonrpcRequest<IndexerUpdatesResponse>(
        app.provider.indexer,
        'balances',
        [accounts],
      );
      return response.balance || {};
    } catch (err) {
      if (err instanceof JSONRPCError) {
        this.captureException(err, 'Indexer:getBalances', err.meta);
      }
      throw err;
    }
  }

  async getTransaction(
    accounts: string[],
    tx_hash: string,
    providerId = app.providerId,
  ): Promise<IndexerTransaction | null> {
    try {
      const provider = Provider.getById(providerId);

      if (!provider?.indexer) {
        throw new Error('Indexer is not configured');
      }

      if (!accounts.length) {
        return null;
      }

      const haqqAddresses = accounts.filter(a => !!a).map(AddressUtils.toHaqq);
      const response = await jsonrpcRequest<IndexerTransactionResponse>(
        provider.indexer,
        'transaction',
        [haqqAddresses, tx_hash],
      );
      return response?.txs[0] || {};
    } catch (err) {
      if (err instanceof JSONRPCError) {
        this.captureException(err, 'Indexer:getTransactions', err.meta);
      }
      throw err;
    }
  }

  async getTransactions(
    accounts: string[],
    latestBlock: string = 'latest',
    providerId = app.providerId,
  ): Promise<IndexerTransaction[]> {
    try {
      const provider = Provider.getById(providerId);

      if (!provider?.indexer) {
        throw new Error('Indexer is not configured');
      }

      if (!accounts.length) {
        return [];
      }

      const haqqAddresses = accounts.filter(a => !!a).map(AddressUtils.toHaqq);
      const response = await jsonrpcRequest<IndexerTransactionResponse>(
        provider.indexer,
        'transactions',
        [haqqAddresses, latestBlock],
      );
      return response?.txs || {};
    } catch (err) {
      if (err instanceof JSONRPCError) {
        this.captureException(err, 'Indexer:getTransactions', err.meta);
      }
      throw err;
    }
  }

  async getNfts(accounts: string[]): Promise<NftCollectionIndexer[]> {
    try {
      if (!app.provider.indexer) {
        throw new Error('Indexer is not configured');
      }

      if (!accounts.length) {
        return [];
      }

      const haqqAddresses = accounts.filter(a => !!a).map(AddressUtils.toHaqq);
      const response = await jsonrpcRequest<NftCollectionIndexer[]>(
        app.provider.indexer,
        'nft',
        [haqqAddresses],
      );

      return response || [];
    } catch (err) {
      if (err instanceof JSONRPCError) {
        this.captureException(err, 'Indexer:getNfts', err.meta);
      }
      throw err;
    }
  }

  async sushiPools(): Promise<SushiPoolResponse> {
    try {
      if (!app.provider.indexer) {
        throw new Error('Indexer is not configured');
      }

      const response = await jsonrpcRequest<SushiPoolResponse>(
        app.provider.indexer,
        'sushiPools',
        [],
      );

      return response || {};
    } catch (err) {
      if (err instanceof JSONRPCError) {
        this.captureException(err, 'Indexer:sushiPools', err.meta);
      }
      throw err;
    }
  }

  async sushiPoolEstimate({
    amount,
    sender,
    // token_in,
    // token_out,
    route,
    currency_id,
    abortSignal,
  }: SushiPoolEstimateRequest): Promise<SushiPoolEstimateResponse> {
    try {
      if (!app.provider.indexer) {
        throw new Error('Indexer is not configured');
      }

      const response = await jsonrpcRequest<SushiPoolEstimateResponse>(
        app.provider.indexer,
        'sushiPoolEstimate',
        [
          route,
          // AddressUtils.toHaqq(token_in),
          // AddressUtils.toHaqq(token_out),
          AddressUtils.toHaqq(sender),
          amount,
          currency_id,
        ],
        abortSignal,
      );

      return response || {};
    } catch (err) {
      if (err instanceof JSONRPCError) {
        this.captureException(err, 'Indexer:sushiPoolEstimate', err.meta);
      }
      throw err;
    }
  }
}
