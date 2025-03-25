import {JsonRpcProvider} from '@ethersproject/providers';
import {ethers} from 'ethers';

import {ProviderModel} from '@app/models/provider';

import {EthRpcEndpointAvailability} from './eth-rpc-endpoint-availability';

const cache: Record<string, JsonRpcProvider> = {};

export async function getRpcProvider(network: ProviderModel) {
  await EthRpcEndpointAvailability.awaitForInitialization();

  if (cache[network.id]) {
    return cache[network.id];
  }

  const provider = new ethers.providers.JsonRpcProvider(
    network.ethRpcEndpoint,
    {
      chainId: network.ethChainId as number,
      name: network.name,
    },
  );
  cache[network.id] = provider;

  return provider;
}
