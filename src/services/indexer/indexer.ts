import {
  JSONRPCError,
  jsonrpcRequest,
} from '@haqq/shared-react-native/src/jsonrpc-request';
import _ from 'lodash';

import {AddressUtils} from '@app/helpers/address-utils';
import {I18N, getText} from '@app/i18n';
import {AppStore} from '@app/models/app';
import {Contract} from '@app/models/contract';
import {Currencies} from '@app/models/currencies';
import {NftCollectionIndexer} from '@app/models/nft';
import {ALL_NETWORKS_ID, Provider} from '@app/models/provider';
import {
  AddressWallet,
  ChainId,
  ContractNameMap,
  IndexerBalanceItem,
  IndexerTransaction,
  IndexerTransactionResponse,
} from '@app/types';
import {createAsyncTask} from '@app/utils';
import {DEFAULT_PROVIDERS} from '@app/variables/common';

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
import {RpcFetch} from '../rpc';
import {CosmosBalances} from '../rpc/cosmos-balance';
import {fetchIndexerContractBatch} from '../rpc/evm-contract';
import {fetchWalletNftBatch} from '../rpc/evm-nft';

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
    if (AppStore.isRpcOnly) {
      if (Provider.selectedProvider.isHaqqNetwork) {
        let balances = {} as CosmosBalances;
        try {
          balances = await RpcFetch.cosmos.balance(accounts);
        } catch {}

        let evmBalances = [] as IndexerBalanceItem[];
        try {
          if (!balances.available) {
            evmBalances = await RpcFetch.evm.balance(accounts);
          }
        } catch {}

        return {
          balance: balances.available || evmBalances || [],
          staked: balances.staked || [],
          total_staked: balances.totalStaked || [],
          vested: balances.vested || [],
          available: balances.available || evmBalances || [],
          locked: balances.locked || [],
          total: balances.total || [],
          available_for_stake: balances.availableForStake || [],
          last_update: new Date().toISOString(),
          rates: {},
          transactions: [],
          tokens: [],
          nfts: [],
          unlock: {},
        };
      } else {
        const balances = await RpcFetch.evm.balance(accounts);
        return {
          balance: balances,
          staked: [],
          total_staked: [],
          vested: [],
          available: balances,
          locked: [],
          total: balances,
          available_for_stake: [],
          last_update: new Date().toISOString(),
          rates: {},
          transactions: [],
          tokens: [],
          nfts: [],
          unlock: {},
        };
      }
    }
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
    if (AppStore.isRpcOnly) {
      return {};
    }

    if (AppStore.isRpcOnly) {
      const addressList = accountsMap[Provider.selectedProvider.ethChainId];
      const result = await fetchIndexerContractBatch(addressList);

      return {
        [Provider.selectedProvider.ethChainId]: result,
      } as IndexerAddressesResponse;
    }

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
    if (AppStore.isRpcOnly) {
      return addresses.reduce((acc, address) => {
        acc[address] = {name: '', symbol: ''};
        return acc;
      }, {} as ContractNameMap);
    }
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
    if (AppStore.isRpcOnly) {
      return {txs: [], accounts, latestBlock} as unknown as IndexerTransaction;
    }
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
      if (AppStore.isRpcOnly) {
        return [];
      }
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
      if (AppStore.isRpcOnly) {
        return fetchWalletNftBatch(accounts.map(AddressUtils.toEth));
      }
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
    if (AppStore.isRpcOnly) {
      return {
        contracts: [],
        pools: [],
        routes: [],
      };
    }
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
    if (AppStore.isRpcOnly) {
      return {
        amount,
        sender,
        route,
        currency_id,
      } as unknown as SushiPoolEstimateResponse;
    }
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
    if (AppStore.isRpcOnly) {
      const isMainnet =
        DEFAULT_PROVIDERS.find(p => p.id === Provider.selectedProvider.id)
          ?.stage === 'mainnet';
      const explorerBaseUrl = isMainnet
        ? 'https://explorer.haqq.network'
        : 'https://explorer.testedge2.haqq.network';
      const explorerCosmosBaseUrl = isMainnet
        ? 'https://ping.pub'
        : 'https://testnet.ping.pub';
      return {
        // @ts-ignore
        chain_id: Provider.selectedProvider.ethChainId,
        bech32_exists: true,
        swap_default_token0: '0x0',
        swap_default_token1: '0x0',
        swap_enabled: false,
        swap_router_v3: '0x0',
        weth_address: '0x0',
        weth_symbol: 'ISLM',
        enable_unwrapWETH9_call: false,
        explorer_address_url: `${explorerBaseUrl}/address/{{address}}`,
        explorer_cosmos_tx_url: `${explorerCosmosBaseUrl}/haqq/tx/{{tx_hash}}`,
        explorer_token_id_url: `${explorerBaseUrl}/token/{{address}}/instance/{{token_id}}`,
        explorer_token_url: `${explorerBaseUrl}/token/{{address}}`,
        explorer_tx_url: `${explorerBaseUrl}/tx/{{tx_hash}}`,
        indexer_gas_estimate_enabled: false,
        nft_exists: true,
      };
    }
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
    if (AppStore.isRpcOnly) {
      const contract = await Contract.getById(address as AddressWallet);
      return {
        domain_in_whitelist: true,
        message_is_valid: true,
        input_is_valid: true,
        is_eip4361: false,
        contract: contract,
      } as unknown as VerifyContractResponse;
    }
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
    if (AppStore.isRpcOnly) {
      return true;
    }
    try {
      const response = await this.verifyContract({
        method_name: 'eth_signTypedData_v4',
        domain,
        address: '',
      });
      return response.domain_in_whitelist;
    } catch (err) {
      return false;
    }
  }

  async gasEstimate(params: GasEstimateRequest, chainId: number) {
    if (AppStore.isRpcOnly) {
      return {params, chainId} as unknown as GasEstimateResponce;
    }
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
