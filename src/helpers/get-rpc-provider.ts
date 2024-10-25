import {ethers} from 'ethers';

import {ProviderModel} from '@app/models/provider';

import {EthRpcEndpointAvailability} from './eth-rpc-endpoint-availability';

export async function getRpcProvider(provider: ProviderModel) {
  await EthRpcEndpointAvailability.awaitForInitialization();
  return new ethers.providers.StaticJsonRpcProvider(provider.ethRpcEndpoint, {
    chainId: provider.ethChainId,
    name: provider.name,
  });
}
