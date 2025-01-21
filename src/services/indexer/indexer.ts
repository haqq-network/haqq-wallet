import {
  JSONRPCError,
  jsonrpcRequest,
} from '@haqq/shared-react-native/src/jsonrpc-request';
import _ from 'lodash';

import {AddressUtils} from '@app/helpers/address-utils';
import {I18N, getText} from '@app/i18n';
import {Currencies} from '@app/models/currencies';
import {NftCollectionIndexer} from '@app/models/nft';
import {ALL_NETWORKS_ID, Provider} from '@app/models/provider';
import {
  ChainId,
  ContractNameMap,
  IndexerTransaction,
  IndexerTransactionResponse,
} from '@app/types';
import {createAsyncTask} from '@app/utils';

import {
  GasEstimateRequest,
  GasEstimateResponce,
  IndexerAddressesResponse,
  IndexerUpdatesResponse,
  ProviderConfig,
  SushiPoolEstimateRequest,
  SushiPoolEstimateResponse,
  SushiPoolResponse,
  VerifyContractRequest,
  VerifyContractResponse,
} from './indexer.types';

import {RemoteConfig} from '../remote-config';

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

  /**
   * @param chainId - Chain ID of the network for get endpoint by default get from Provider.selectedProvider
   */
  constructor(public chainId?: number | string) {
    if (chainId && !Provider.getByEthChainId(chainId)) {
      throw new Error('indexer: invalid chain id');
    }
    this.init();
  }

  public getProvidersHeader = (
    accounts: string[],
    provider = Provider.selectedProvider,
  ) => {
    if (provider.id === ALL_NETWORKS_ID) {
      return Provider.getAllNetworks().reduce(
        (acc, item) => ({
          ...acc,
          [item.ethChainId]: AddressUtils.convertAddressByNetwork(
            accounts,
            item.networkType,
          ),
        }),
        {},
      );
    }

    return {
      [provider.ethChainId]: AddressUtils.convertAddressByNetwork(
        accounts,
        provider.networkType,
      ),
    };
  };

  get endpoint() {
    if (this.chainId) {
      return Provider.getByEthChainId(this.chainId)?.indexer!;
    }

    return Provider.selectedProvider.indexer;
  }

  checkIndexerAvailability = (): void => {
    if (!this.endpoint) {
      throw new Error('Indexer is not configured');
    }
  };

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

  updates = createAsyncTask(async (accounts: string[], lastUpdated?: Date) => {
    try {
      this.checkIndexerAvailability();

      const updated = lastUpdated || new Date(0);

      return await jsonrpcRequest<IndexerUpdatesResponse>(
        RemoteConfig.get('proxy_server')!,
        'updates_v2',
        [
          this.getProvidersHeader(accounts),
          updated,
          Currencies.selectedCurrency,
        ].filter(Boolean),
      );
    } catch (err) {
      if (err instanceof JSONRPCError) {
        this.captureException(err, 'Indexer:updates', err.meta);
      }
      throw err;
    }
  });

  getAddresses = async (accountsMap: Record<ChainId, string[]>) => {
    try {
      this.checkIndexerAvailability();

      return await jsonrpcRequest<IndexerAddressesResponse>(
        RemoteConfig.get('proxy_server')!,
        'addresses',
        [accountsMap],
      );
    } catch (err) {
      if (err instanceof JSONRPCError) {
        this.captureException(err, 'Indexer:addresses', err.meta);
      }
      throw err;
    }
  };

  async getContractNames(addresses: string[]): Promise<ContractNameMap> {
    try {
      this.checkIndexerAvailability();

      if (addresses.length === 0) {
        return Promise.reject('Empty addresses');
      }

      const response = await jsonrpcRequest<
        {name: string; id: string; symbol: string}[]
      >(this.endpoint, 'addresses', [addresses.map(AddressUtils.toHaqq)]);

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

  async getTransaction(
    accounts: string[],
    latestBlock: string = 'latest',
  ): Promise<IndexerTransaction | null> {
    try {
      if (!accounts.length) {
        return null;
      }

      const haqqAddresses = accounts.filter(a => !!a).map(AddressUtils.toHaqq);
      const response = await jsonrpcRequest<IndexerTransactionResponse>(
        this.endpoint,
        'transactions',
        [haqqAddresses, latestBlock],
      );
      return response?.txs?.[0] ?? null;
    } catch (err) {
      if (err instanceof JSONRPCError) {
        this.captureException(err, 'Indexer:getTransaction', err.meta);
      }
      throw err;
    }
  }

  getTransactions = createAsyncTask(
    async (
      accounts: string[] | Record<ChainId, string[]>,
      latestBlock: string | null,
    ): Promise<IndexerTransaction[]> => {
      try {
        if (Array.isArray(accounts) && !accounts.length) {
          return [];
        }

        if (
          typeof accounts === 'object' &&
          Object.values(accounts).every(addresses => !addresses.length)
        ) {
          return [];
        }

        const response = await jsonrpcRequest<IndexerTransactionResponse>(
          RemoteConfig.get('proxy_server')!,
          'transactions_by_timestamp',
          [accounts, latestBlock ?? 'latest'],
        );

        return response?.transactions || [];
      } catch (err) {
        if (err instanceof JSONRPCError) {
          this.captureException(err, 'Indexer:getTransactions', err.meta);
        }
        throw err;
      }
    },
  );

  getNfts = createAsyncTask(async (accounts: string[]) => {
    try {
      this.checkIndexerAvailability();

      if (!accounts.length) {
        return [];
      }

      const response = await jsonrpcRequest<NftCollectionIndexer[]>(
        RemoteConfig.get('proxy_server')!,
        'nfts',
        [this.getProvidersHeader(accounts)],
      );

      return response || [];
    } catch (err) {
      if (err instanceof JSONRPCError) {
        this.captureException(err, 'Indexer:getNfts', err.meta);
      }
      throw err;
    }
  });

  async sushiPools(): Promise<SushiPoolResponse> {
    try {
      this.checkIndexerAvailability();

      const response = await jsonrpcRequest<SushiPoolResponse>(
        this.endpoint,
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
    route,
    currency_id,
    abortSignal,
  }: SushiPoolEstimateRequest): Promise<SushiPoolEstimateResponse> {
    try {
      this.checkIndexerAvailability();

      const response = await jsonrpcRequest<SushiPoolEstimateResponse>(
        this.endpoint,
        'sushiPoolEstimate',
        [route, AddressUtils.toHaqq(sender), amount, currency_id],
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

  async getProviderConfig(): Promise<ProviderConfig> {
    try {
      this.checkIndexerAvailability();

      const response = await jsonrpcRequest<ProviderConfig>(
        this.endpoint,
        'config',
        [],
      );

      return response ?? {};
    } catch (err) {
      if (err instanceof JSONRPCError) {
        this.captureException(err, 'Indexer:getProviderConfig', err.meta);
      }
      throw err;
    }
  }

  async verifyContract({
    method_name,
    domain,
    message_or_input,
    address,
  }: VerifyContractRequest): Promise<VerifyContractResponse> {
    try {
      this.checkIndexerAvailability();
      const params = [method_name, domain, message_or_input ?? '0x0'];

      if (address) {
        params.push(address);
      }

      const response = await jsonrpcRequest<VerifyContractResponse>(
        this.endpoint,
        'verifyContract',
        params,
      );

      return response ?? {};
    } catch (err) {
      if (err instanceof JSONRPCError) {
        this.captureException(err, 'Indexer:verifyContract', err.meta);
      }
      throw err;
    }
  }

  async validateDappDomain(domain: string): Promise<boolean> {
    try {
      const response = await this.verifyContract({
        method_name: 'eth_signTypedData_v4',
        domain,
      });
      return response.domain_in_whitelist;
    } catch (err) {
      return false;
    }
  }

  async gasEstimate(params: GasEstimateRequest, chainId: number) {
    try {
      this.checkIndexerAvailability();

      const response = await jsonrpcRequest<GasEstimateResponce>(
        RemoteConfig.get('proxy_server')!,
        'gasEstimate',
        [params, chainId],
      );

      return response ?? {};
    } catch (err) {
      if (err instanceof JSONRPCError) {
        this.captureException(err, 'Indexer:gasEstimate', err.meta);
      }
      throw err;
    }
  }
}
