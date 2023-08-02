import {jsonrpcRequest} from '@haqq/shared-react-native';
import {ethers} from 'ethers';

import {getAvailableEndpoint} from '@app/helpers/get-available-endpoint';
import {runWithTimeout} from '@app/helpers/run-with-timeout';
import {Provider} from '@app/models/provider';

async function checkRPCEndpoint(endpoint: string, endpoints: string[]) {
  try {
    await runWithTimeout<string>(
      jsonrpcRequest(endpoint, 'eth_blockNumber', []),
    );

    return endpoint;
  } catch (e) {
    return await getAvailableEndpoint(endpoints);
  }
}

export async function getRpcProvider(provider: Provider) {
  const endpoint = await getRpcProviderEndpoint(provider);

  return new ethers.providers.StaticJsonRpcProvider(endpoint, {
    chainId: provider.ethChainId,
    name: provider.id,
  });
}

export async function getRpcProviderEndpoint(provider: Provider) {
  let endpoint = await checkRPCEndpoint(
    provider.ethRpcEndpoint,
    provider.evmEndpoints,
  );

  if (!endpoint) {
    throw new Error('No available endpoint');
  }

  return endpoint;
}
