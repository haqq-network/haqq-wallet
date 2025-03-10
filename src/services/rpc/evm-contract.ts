import {JsonRpcProvider} from '@ethersproject/providers';
import {ethers} from 'ethers';

import {AddressUtils} from '@app/helpers/address-utils';
import {getRpcProvider} from '@app/helpers/get-rpc-provider';
import {getUid} from '@app/helpers/get-uid';
import {IndexerContract} from '@app/models/contract';
import {Provider} from '@app/models/provider';
import {ERC20_ABI} from '@app/variables/abi';
import {DEFAULT_PROVIDERS} from '@app/variables/common';

import {explorerFetch} from './explorer-fetch';

import {EventTracker} from '../event-tracker';

export async function fetchERC20Contract(
  address: string,
  rpcProvider: JsonRpcProvider,
): Promise<IndexerContract | null> {
  try {
    let symbol = '';
    let decimals = 0;
    let name = '';
    let icon = '';
    try {
      const ethAddress = AddressUtils.toEth(address);
      const REST_URL = DEFAULT_PROVIDERS.find(
        it => it.id === Provider.selectedProvider.id,
      )?.explorer_url;
      const headers = {
        'Content-Type': 'application/json',
        'haqq-user-id': await EventTracker.instance.getAdid('posthog'),
        'haqq-app-id': await getUid(),
      };
      const tokenUrl = `${REST_URL}/api/v2/tokens/${ethAddress}`;
      const rawData = await fetch(tokenUrl, {
        method: 'GET',
        headers: headers,
      }).then(res => res.json());

      symbol = rawData.symbol;
      decimals = Number(rawData.decimals);
      name = rawData.name;
      icon = rawData.icon_url;
    } catch {}

    const contractInterface = new ethers.Contract(
      AddressUtils.toEth(address),
      ERC20_ABI,
      rpcProvider,
    );

    if (!symbol) {
      symbol = await contractInterface.symbol();
    }
    if (!decimals) {
      decimals = await contractInterface.decimals();
    }
    if (!name) {
      name = await contractInterface.name();
    }

    return {
      chain_id: Provider.selectedProvider.ethChainId,
      coingecko_id: null,
      created_at: new Date().toISOString(),
      decimals,
      eth_address: AddressUtils.toEth(address),
      ibc: null,
      icon: icon,
      id: AddressUtils.toEth(address),
      is_coingecko_watch: null,
      is_erc1155: false,
      is_erc20: true,
      is_erc721: false,
      is_in_white_list: null,
      is_skip_eth_tx: null,
      is_transfer_prohibinden: null,
      min_input_amount: 0,
      name,
      symbol,
      updated_at: new Date().toISOString(),
    };
  } catch (e) {
    Logger.error('Failed to load erc20 contract from rpc', e);
    return null;
  }
}

export async function fetchERC20ContractBatch(addresses: string[]) {
  const rpcProvider = await getRpcProvider(Provider.selectedProvider);
  const contracts = await Promise.all(
    addresses.map(a => fetchERC20Contract(a, rpcProvider)),
  );
  return contracts;
}

interface ExplorerContract {
  name: string;
  decimals: number;
  icon_url: string;
  symbol: string;
  type: 'ERC-20' | 'ERC-721' | 'ERC-1155';
}

export async function fetchIndexerContract(
  address: string,
): Promise<IndexerContract> {
  try {
    const ethAddress = AddressUtils.toEth(address);

    const rawData = await explorerFetch<ExplorerContract>(
      `tokens/${ethAddress}`,
      {useApiV2: true},
    );

    if (!rawData || !rawData.name) {
      const scResponse = await explorerFetch<ExplorerContract>(
        `smart-contracts/${ethAddress}`,
        {
          useApiV2: true,
        },
      );

      return {
        chain_id: Provider.selectedProvider.ethChainId,
        coingecko_id: null,
        created_at: new Date().toISOString(),
        decimals: null,
        eth_address: ethAddress,
        ibc: null,
        icon: null,
        id: ethAddress,
        is_coingecko_watch: null,
        is_erc1155: scResponse?.type === 'ERC-1155',
        is_erc721: scResponse?.type === 'ERC-721',
        is_erc20: scResponse?.type === 'ERC-20',
        is_in_white_list: null,
        is_skip_eth_tx: null,
        is_transfer_prohibinden: null,
        min_input_amount: null,
        name: scResponse?.name || 'Unknown',
        symbol: null,
        updated_at: new Date().toISOString(),
      };
    }

    return {
      chain_id: Provider.selectedProvider.ethChainId,
      coingecko_id: null,
      created_at: new Date().toISOString(),
      decimals: rawData.decimals ? Number(rawData.decimals) : null,
      eth_address: ethAddress,
      ibc: null,
      icon: rawData.icon_url || null,
      id: ethAddress,
      is_coingecko_watch: null,
      is_erc1155: rawData.type === 'ERC-1155',
      is_erc721: rawData.type === 'ERC-721',
      is_erc20: rawData.type === 'ERC-20',
      is_in_white_list: null,
      is_skip_eth_tx: null,
      is_transfer_prohibinden: null,
      min_input_amount: null,
      name: rawData.name || null,
      symbol: rawData.symbol || null,
      updated_at: new Date().toISOString(),
    };
  } catch {
    return {
      chain_id: Provider.selectedProvider.ethChainId,
      coingecko_id: null,
      created_at: new Date().toISOString(),
      decimals: null,
      eth_address: AddressUtils.toEth(address),
      ibc: null,
      icon: null,
      id: AddressUtils.toEth(address),
      is_coingecko_watch: null,
      is_erc1155: false,
      is_erc721: false,
      is_erc20: false,
      is_in_white_list: null,
      is_skip_eth_tx: null,
      is_transfer_prohibinden: null,
      min_input_amount: null,
      name: 'UNKNOWN',
      symbol: null,
      updated_at: new Date().toISOString(),
    };
  }
}

export async function fetchIndexerContractBatch(addresses: string[]) {
  const contracts = await Promise.all(
    addresses.map(async a => {
      try {
        return await fetchIndexerContract(a);
      } catch {
        return undefined;
      }
    }),
  );
  return contracts.filter(c => !!c);
}
