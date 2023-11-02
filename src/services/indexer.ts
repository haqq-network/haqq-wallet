import {jsonrpcRequest} from '@haqq/shared-react-native';

import {app} from '@app/contexts';
import {AddressUtils} from '@app/helpers/address-utils';
import {Whitelist} from '@app/helpers/whitelist';
import {I18N, getText} from '@app/i18n';
import {
  ContractNameMap,
  IContract,
  IndexerBalance,
  IndexerTime,
  IndexerToken,
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

    const response = await jsonrpcRequest<{name: string; id: string}[]>(
      app.provider.indexer,
      'addresses',
      [addresses.map(AddressUtils.toHaqq)],
    );

    const map = addresses.reduce((acc, item) => {
      const responseExist = Array.isArray(response) && response.length > 0;
      const newValue = responseExist
        ? response.find(infoItem => infoItem.id === AddressUtils.toHaqq(item))
            ?.name
        : null;

      acc[item] = newValue ?? getText(I18N.transactionContractDefaultName);
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
}
