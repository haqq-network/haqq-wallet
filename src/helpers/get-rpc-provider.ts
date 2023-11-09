import {ethers} from 'ethers';

import {Provider} from '@app/models/provider';

import {EthRpcEndpointAvailability} from './eth-rpc-endpoint-availability';

export async function getRpcProvider(provider: Provider) {
  await EthRpcEndpointAvailability.awaitForInitialization();
  return new ethers.providers.StaticJsonRpcProvider(provider.ethRpcEndpoint, {
    chainId: provider.ethChainId,
    name: provider.id,
  });
}
