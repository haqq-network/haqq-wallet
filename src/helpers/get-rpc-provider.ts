import {ethers} from 'ethers';

import {Provider} from '@app/models/provider';

export async function getRpcProvider(provider: Provider) {
  return new ethers.providers.StaticJsonRpcProvider(provider.ethRpcEndpoint, {
    chainId: provider.ethChainId,
    name: provider.id,
  });
}
