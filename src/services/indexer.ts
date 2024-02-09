import {jsonrpcRequest} from '@haqq/shared-react-native';

import {app} from '@app/contexts';
import {AddressUtils} from '@app/helpers/address-utils';
import {Whitelist} from '@app/helpers/whitelist';
import {I18N, getText} from '@app/i18n';
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

export class Indexer {
  static instance = new Indexer();

  static headers = {
    accept: 'application/json, text/plain, */*',
    'accept-language': 'en-US,en;q=0.9,ru;q=0.8',
    connection: 'keep-alive',
    'content-type': 'application/json;charset=UTF-8',
  };

  async updates(
    accounts: string[],
    lastUpdated: Date | undefined,
  ): Promise<IndexerUpdatesResponse> {
    if (!app.provider.indexer) {
      throw new Error('Indexer is not configured');
    }

    const updated = lastUpdated || new Date(0);

    const result: IndexerUpdatesResponse = await jsonrpcRequest(
      app.provider.indexer,
      'updates',
      [accounts, updated].filter(Boolean),
    );

    return result;
  }

  async getContractName(address: string): Promise<string> {
    const info = await Whitelist.verifyAddress(address);
    return info?.name ?? getText(I18N.transactionContractDefaultName);
  }

  async getContractNames(addresses: string[]): Promise<ContractNameMap> {
    if (!app.provider.indexer) {
      throw new Error('Indexer is not configured');
    }

    if (addresses.length === 0) {
      return Promise.reject('Empty addresses');
    }

    const response = await jsonrpcRequest<
      {name: string; id: string; symbol: string}[]
    >(app.provider.indexer, 'addresses', [addresses.map(AddressUtils.toHaqq)]);

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
  }

  async getBalances(accounts: string[]): Promise<Record<string, string>> {
    if (!app.provider.indexer) {
      throw new Error('Indexer is not configured');
    }

    const response = await jsonrpcRequest<IndexerUpdatesResponse>(
      app.provider.indexer,
      'balances',
      [accounts],
    );
    return response.balance || {};
  }

  async getTransactions(
    accounts: string[],
    latestBlock: string = 'latest',
    providerId = app.providerId,
  ): Promise<IndexerTransaction[]> {
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
  }
}
