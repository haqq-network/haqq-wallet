import {jsonrpcRequest} from '@haqq/shared-react-native';

import {app} from '@app/contexts';
import {I18N, getText} from '@app/i18n';
import {Cosmos} from '@app/services/cosmos';
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

    return {
      ...result,
      tokens: [
        {
          address: 'haqq1dqkx0uhsr0q5adj09qxzc52jfaehkxkd43dwtd',
          contract: 'haqq1plk7pd2nyp6v727kqqc676hj7n0ch459wy3yy2',
          created_at: '2023-10-18T09:25:44.432964Z',
          updated_at: '2023-10-18T09:25:44.611416Z',
          value: '5000000000000000000',
        },
      ],
      addresses: [
        // nft
        {
          address_type: 'contract',
          created_at: '2023-10-18T07:22:13.948344Z',
          decimals: null,
          icon: null,
          id: 'haqq1du65aw4dm9665y6rw6k2f8f9rvkg3qd246yjqt',
          is_erc1155: true,
          is_erc20: null,
          is_erc721: false,
          is_in_white_list: null,
          name: null,
          symbol: null,
          updated_at: '2023-10-18T07:22:13.948343Z',
        },
        {
          address_type: 'contract',
          created_at: '2023-10-17T10:01:13.950901Z',
          decimals: null,
          icon: null,
          id: 'haqq1uy9rr0qdgr84jcgmlgp0hlmj3jtuma045r863q',
          is_erc1155: true,
          is_erc20: null,
          is_erc721: false,
          is_in_white_list: null,
          name: null,
          symbol: null,
          updated_at: '2023-10-17T10:01:13.950900Z',
        },
        // tokens
        {
          address_type: 'contract',
          created_at: '2023-10-17T09:57:47.211126Z',
          decimals: 18,
          icon: null,
          id: 'haqq1plk7pd2nyp6v727kqqc676hj7n0ch459wy3yy2',
          is_erc1155: null,
          is_erc20: true,
          is_erc721: null,
          is_in_white_list: null,
          name: 'HaqqTokenDemo',
          symbol: 'HTD',
          updated_at: '2023-10-17T09:57:47.211125Z',
        },
      ],
    };
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

    const response = await jsonrpcRequest<{name: string; id: string}[]>(
      app.provider.indexer,
      'addresses',
      [addresses.map(Cosmos.addressToBech32)],
    );

    const map = addresses.reduce((acc, item) => {
      const responseExist = Array.isArray(response) && response.length > 0;
      const newValue = responseExist
        ? response.find(
            infoItem => infoItem.id === Cosmos.addressToBech32(item),
          )?.name
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
