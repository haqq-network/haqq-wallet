import {jsonrpcRequest} from '@haqq/shared-react-native';

import {app} from '@app/contexts';
import {I18N, getText} from '@app/i18n';
import {Cosmos} from '@app/services/cosmos';
import {ContractNameMap} from '@app/types';

export type IndexerUpdatesResponse = {
  balance: Record<string, string>;
  last_update: string;
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

    return await jsonrpcRequest(
      app.provider.indexer,
      'updates',
      [accounts, updated].filter(Boolean),
    );
  }

  async getContractName(address: string): Promise<string> {
    if (!app.provider.indexer) {
      throw new Error('Indexer is not configured');
    }

    const info = await jsonrpcRequest<{name: string} | null>(
      app.provider.indexer,
      'address',
      [Cosmos.addressToBech32(address)],
    );

    return info?.name ?? getText(I18N.transactionContractDefaultName);
  }

  async getContractNames(addresses: string[]): Promise<ContractNameMap> {
    if (!app.provider.indexer) {
      throw new Error('Indexer is not configured');
    }

    if (addresses.length === 0) {
      return Promise.reject('Empty addresses');
    }

    const info = await jsonrpcRequest<{name: string; id: string}[]>(
      app.provider.indexer,
      'addresses',
      [addresses.map(Cosmos.addressToBech32)],
    );

    if (!Array.isArray(info)) {
      return {};
    }

    const map = addresses.reduce((acc, item) => {
      acc[item] =
        info.find(infoItem => infoItem.id === Cosmos.addressToBech32(item))
          ?.name ?? getText(I18N.transactionContractDefaultName);
      return acc;
    }, {} as ContractNameMap);

    return map;
  }
}
