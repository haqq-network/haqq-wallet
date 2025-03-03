import {JsonRpcProvider} from '@ethersproject/providers';
import {ethers} from 'ethers';

import {AddressUtils} from '@app/helpers/address-utils';
import {getRpcProvider} from '@app/helpers/get-rpc-provider';
import {getUid} from '@app/helpers/get-uid';
import {IndexerContract} from '@app/models/contract';
import {Provider} from '@app/models/provider';
import {ERC20_ABI} from '@app/variables/abi';
import {DEFAULT_PROVIDERS} from '@app/variables/common';

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

export async function fetchIndexerContract(
  address: string,
): Promise<IndexerContract> {
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

  if (!rawData || !rawData.name) {
    const scUrl = `${REST_URL}/api/v2/smart-contracts/${ethAddress}`;
    const scResponse = await fetch(scUrl, {
      method: 'GET',
      headers: headers,
    }).then(res => res.json());

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
      is_erc1155: null,
      is_erc20: false,
      is_erc721: false,
      is_in_white_list: null,
      is_skip_eth_tx: null,
      is_transfer_prohibinden: null,
      min_input_amount: null,
      name: scResponse?.name || 'Unknown',
      symbol: null,
      updated_at: new Date().toISOString(),
    };
  }

  const isErc20 = rawData.type === 'ERC-20';
  const isErc721 = rawData.type === 'ERC-721';
  const isErc1155 = rawData.type === 'ERC-1155';

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
    is_erc1155: isErc1155 || null,
    is_erc20: isErc20 || null,
    is_erc721: isErc721 || null,
    is_in_white_list: null,
    is_skip_eth_tx: null,
    is_transfer_prohibinden: null,
    min_input_amount: null,
    name: rawData.name || null,
    symbol: rawData.symbol || null,
    updated_at: new Date().toISOString(),
  };
}

export async function fetchIndexerContractBatch(addresses: string[]) {
  const contracts = await Promise.all(
    addresses.map(a => fetchIndexerContract(a)),
  );
  return contracts;
}
