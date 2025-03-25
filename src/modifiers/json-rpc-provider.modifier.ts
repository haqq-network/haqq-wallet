import {JsonRpcProvider} from '@ethersproject/providers';
import {ethers} from 'ethers';

import {Provider} from '@app/models/provider';
import {EventTracker} from '@app/services/event-tracker';
import {MarketingEvents} from '@app/types';
import {ERC20_ABI} from '@app/variables/abi';

interface JsonRpcResponse {
  result?: any;
  error?: {
    message: string;
    code: number;
    data?: any;
  };
}

interface ERC20TokenInfo {
  decimals?: number;
  symbol?: string;
  name?: string;
  [key: string]: any; // Add index signature for dynamic properties
}

interface CacheConfig {
  expiryMs: number;
  methods: string[];
}

interface CacheEntry<T> {
  value: T;
  timestamp: number;
}

const logger = Logger.create('JsonRpcProvider', {
  stringifyJson: true,
  emodjiPrefix: '🟣',
  enabled: false,
});

// Cache configurations
const CACHE_CONFIGS: Record<string, CacheConfig> = {
  default: {
    expiryMs: 60000, // 1 minute
    methods: [
      'eth_chainId',
      'eth_blockNumber',
      'eth_getBlockByNumber',
      'eth_gasPrice',
      'eth_estimateGas',
    ],
  },
  // for caching erc20 symbol, name, decimals
  erc20: {
    expiryMs: -1, // No expiry
    methods: ['eth_call'],
  },
  // for caching erc20 balance
  balance: {
    expiryMs: 30000, // 30 seconds
    methods: ['eth_call'],
  },
};

const SEND_METHODS = ['eth_sendRawTransaction', 'eth_sendTransaction'];

// Unified cache storage
class CacheStore {
  private static instance: CacheStore;
  private methodCache: Map<string, CacheEntry<any>>;
  private erc20Cache: Map<string, ERC20TokenInfo>;
  private erc20BalanceCache: Map<string, Map<string, CacheEntry<string>>>;

  private constructor() {
    this.methodCache = new Map();
    this.erc20Cache = new Map();
    this.erc20BalanceCache = new Map();
  }

  public static getInstance(): CacheStore {
    if (!CacheStore.instance) {
      CacheStore.instance = new CacheStore();
    }
    return CacheStore.instance;
  }

  public getMethodCache(method: string): any | undefined {
    const entry = this.methodCache.get(method);
    if (!entry) {
      return undefined;
    }

    if (this.isExpired(entry.timestamp, CACHE_CONFIGS.default.expiryMs)) {
      this.methodCache.delete(method);
      return undefined;
    }

    return entry.value;
  }

  public setMethodCache(method: string, value: any): void {
    if (CACHE_CONFIGS.default.methods.includes(method)) {
      this.methodCache.set(method, {
        value,
        timestamp: Date.now(),
      });
    }
  }

  public getERC20Cache(tokenAddress: string): ERC20TokenInfo | undefined {
    return this.erc20Cache.get(tokenAddress);
  }

  public setERC20Cache(tokenAddress: string, info: ERC20TokenInfo): void {
    this.erc20Cache.set(tokenAddress, info);
  }

  public getERC20BalanceCache(
    tokenAddress: string,
    walletAddress: string,
  ): string | undefined {
    const tokenCache = this.erc20BalanceCache.get(tokenAddress);
    if (!tokenCache) {
      return undefined;
    }

    const balanceEntry = tokenCache.get(walletAddress);
    if (!balanceEntry) {
      return undefined;
    }

    if (
      this.isExpired(balanceEntry.timestamp, CACHE_CONFIGS.balance.expiryMs)
    ) {
      tokenCache.delete(walletAddress);
      return undefined;
    }

    return balanceEntry.value;
  }

  public setERC20BalanceCache(
    tokenAddress: string,
    walletAddress: string,
    balance: string,
  ): void {
    let tokenCache = this.erc20BalanceCache.get(tokenAddress);
    if (!tokenCache) {
      tokenCache = new Map();
      this.erc20BalanceCache.set(tokenAddress, tokenCache);
    }

    tokenCache.set(walletAddress, {
      value: balance,
      timestamp: Date.now(),
    });
  }

  public invalidateCache(
    method?: string,
    tokenAddress?: string,
    walletAddress?: string,
  ): void {
    if (method) {
      this.methodCache.delete(method);
    }
    if (tokenAddress) {
      this.erc20Cache.delete(tokenAddress);
      this.erc20BalanceCache.delete(tokenAddress);
    }
    if (walletAddress && tokenAddress) {
      const tokenCache = this.erc20BalanceCache.get(tokenAddress);
      if (tokenCache) {
        tokenCache.delete(walletAddress);
      }
    }
  }

  private isExpired(timestamp: number, expiryMs: number): boolean {
    return Date.now() - timestamp > expiryMs;
  }
}

/**
 * Extracts result from JSON-RPC response, throwing an error if one exists
 */
function extractRpcResult(payload: JsonRpcResponse): any {
  if (payload.error) {
    const error: Error & {code?: number; data?: any} = new Error(
      payload.error.message,
    );
    error.code = payload.error.code;
    error.data = payload.error.data;
    throw error;
  }
  return payload.result;
}

/**
 * Extracts sender address from transaction params
 */
function extractSenderAddress(params: any[]): string {
  try {
    if (params?.[0] && typeof params[0] === 'string') {
      const hexString = params[0].replace(/^0x/, '');
      return (
        ethers.utils.parseTransaction(Buffer.from(hexString, 'hex'))?.from ??
        'unknown'
      );
    }
  } catch (e) {
    // Silent failure - best effort extraction
  }
  return 'unknown';
}

/**
 * Override of JsonRpcProvider.send method to add caching and event tracking
 */
JsonRpcProvider.prototype.send = async function (
  method: string,
  params: any[],
): Promise<any> {
  logger.log('call', {
    method,
    params,
    nextId: this._nextId,
  });
  const cacheStore = CacheStore.getInstance();

  // Special case for chainId
  if (method === 'eth_chainId') {
    return Provider.selectedProvider.ethChainId;
  }

  // Check method cache first
  const cachedResult = cacheStore.getMethodCache(method);
  if (cachedResult !== undefined) {
    logger.log('method cache hit', cachedResult);
    return cachedResult;
  }

  // Special handling for eth_call with ERC20 methods
  try {
    if (method === 'eth_call') {
      const {data, to} = params[0] || {};
      if (data && to) {
        const parsed = new ethers.utils.Interface(ERC20_ABI).parseTransaction({
          data: data,
        });

        if (parsed.name === 'balanceOf') {
          const wallet = parsed.args[0] as string;
          const cachedBalance = cacheStore.getERC20BalanceCache(to, wallet);
          if (cachedBalance !== undefined) {
            logger.log('erc20 balance cache hit', {
              method,
              wallet,
              tokenAddress: to,
              cachedBalance,
            });
            return cachedBalance;
          }
        } else {
          const tokenInfo = cacheStore.getERC20Cache(to);
          if (tokenInfo) {
            const cachedValue = tokenInfo[parsed.name];
            if (cachedValue !== undefined) {
              logger.log('erc20 cache hit', {
                method,
                tokenAddress: to,
                cachedValue,
              });
              return cachedValue;
            }
          }
        }
      }
    }
  } catch (e) {
    logger.error('eth_call get cache error', e);
  }

  // Prepare request
  const request = {
    method,
    params,
    id: this._nextId++,
    jsonrpc: '2.0',
  };

  const isSendMethod = SEND_METHODS.includes(method);
  const senderAddress = isSendMethod ? extractSenderAddress(params) : 'unknown';

  // Prepare event tracking parameters
  const eventParams = {
    type: 'EVM',
    network: Provider.selectedProvider.name,
    chainId: `${Provider.selectedProvider.ethChainId}`,
    address: senderAddress,
  };

  try {
    // Track transaction start if applicable
    if (isSendMethod) {
      EventTracker.instance.trackEvent(
        MarketingEvents.sendTxStart,
        eventParams,
      );
    }

    // Execute the request
    const response = await fetch(`${this.connection.url}`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(request),
    });

    // Process response
    const responseData = await response.json();
    const result = extractRpcResult(responseData);

    // Track successful transaction if applicable
    if (isSendMethod) {
      EventTracker.instance.trackEvent(
        MarketingEvents.sendTxSuccess,
        eventParams,
      );
    }

    // Update caches
    cacheStore.setMethodCache(method, result);

    try {
      // Update token cache if applicable
      if (method === 'eth_call') {
        const {data, to} = params[0] || {};
        if (data && to) {
          const parsed = new ethers.utils.Interface(ERC20_ABI).parseTransaction(
            {
              data: data,
            },
          );

          if (parsed.name === 'balanceOf') {
            const wallet = parsed.args[0] as string;
            cacheStore.setERC20BalanceCache(to, wallet, result);
          } else {
            const tokenInfo = cacheStore.getERC20Cache(to) || {};
            tokenInfo[parsed.name] = result;
            cacheStore.setERC20Cache(to, tokenInfo);
          }
        }
      }
    } catch (e) {
      logger.error('eth_call set cache error', e);
    }

    logger.log('common result', result);
    return result;
  } catch (error) {
    // Track failed transaction if applicable
    if (isSendMethod) {
      EventTracker.instance.trackEvent(MarketingEvents.sendTxFail, eventParams);
    }
    throw error;
  }
};
