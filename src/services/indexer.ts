import {jsonrpcRequest} from '@haqq/shared-react-native';

import {app} from '@app/contexts';

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
}
