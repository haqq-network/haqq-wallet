import {JsonRpcProvider} from '@ethersproject/providers';
import {ethers} from 'ethers';

import {Provider} from '@app/models/provider';
import {EventTracker} from '@app/services/event-tracker';
import {MarketingEvents} from '@app/types';
import {parseTxDataFromHexInput} from '@app/utils';

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
}

// Constants
const CACHED_METHODS = ['eth_chainId', 'eth_blockNumber'];
const SEND_METHODS = ['eth_sendRawTransaction', 'eth_sendTransaction'];
const CACHE_EXPIRY_MS = 30000; // 30 seconds

// Cache storage
const methodCache = new Map<string, {value: any; timestamp: number}>();
const erc20Cache = new Map<string, ERC20TokenInfo>();

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
 * Gets cached result if valid and available
 */
function getCachedResult(method: string): any | undefined {
  if (!CACHED_METHODS.includes(method) || !methodCache.has(method)) {
    return undefined;
  }

  const cachedItem = methodCache.get(method)!;
  const now = Date.now();

  // Check if cache has expired
  if (now - cachedItem.timestamp > CACHE_EXPIRY_MS) {
    methodCache.delete(method);
    return undefined;
  }

  return cachedItem.value;
}

/**
 * Caches a method result
 */
function cacheResult(method: string, result: any): void {
  if (CACHED_METHODS.includes(method)) {
    methodCache.set(method, {
      value: result,
      timestamp: Date.now(),
    });
  }
}

/**
 * Attempts to get ERC20 token info from cache
 */
function getTokenInfoFromCache(
  tokenAddress: string,
  methodName: string,
): any | undefined {
  const token = erc20Cache.get(tokenAddress);
  if (!token) {
    return undefined;
  }

  switch (methodName) {
    case 'name':
      return token.name;
    case 'symbol':
      return token.symbol;
    case 'decimals':
      return token.decimals;
    default:
      return undefined;
  }
}

/**
 * Updates ERC20 token cache with new information
 */
function updateTokenCache(
  tokenAddress: string,
  methodName: string,
  result: any,
): void {
  const token = erc20Cache.get(tokenAddress) || ({} as ERC20TokenInfo);

  switch (methodName) {
    case 'name':
      token.name = result;
      break;
    case 'symbol':
      token.symbol = result;
      break;
    case 'decimals':
      token.decimals = result;
      break;
  }

  erc20Cache.set(tokenAddress, token);
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
  // Check cache first
  const cachedResult = getCachedResult(method);
  if (cachedResult !== undefined) {
    return cachedResult;
  }

  // Special handling for eth_call with ERC20 methods
  if (method === 'eth_call') {
    const {data} = params[0] || {};
    if (data) {
      const parsed = parseTxDataFromHexInput(data) as {name: string} | null;
      if (parsed?.name && params[0]?.to) {
        const tokenAddress = params[0].to;
        const cachedValue = getTokenInfoFromCache(tokenAddress, parsed.name);
        if (cachedValue !== undefined) {
          return cachedValue;
        }
      }
    }
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
    cacheResult(method, result);

    // Update token cache if applicable
    if (method === 'eth_call') {
      const {data} = params[0] || {};
      if (data && params[0]?.to) {
        const parsed = parseTxDataFromHexInput(data) as {name: string} | null;
        if (parsed?.name) {
          updateTokenCache(params[0].to, parsed.name, result);
        }
      }
    }

    return result;
  } catch (error) {
    // Track failed transaction if applicable
    if (isSendMethod) {
      EventTracker.instance.trackEvent(MarketingEvents.sendTxFail, eventParams);
    }
    throw error;
  }
};
