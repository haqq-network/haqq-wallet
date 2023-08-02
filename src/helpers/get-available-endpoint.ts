import {jsonrpcRequest} from '@haqq/shared-react-native';

import {runWithTimeout} from '@app/helpers/run-with-timeout';

export async function getAvailableEndpoint(endpoints: string[]) {
  const available = endpoints.map(endpoint =>
    runWithTimeout<string>(jsonrpcRequest(endpoint, 'eth_blockNumber', []))
      .then(data => ({
        block: parseInt(data, 16),
        endpoint,
      }))
      .catch(() => ({
        block: null,
        endpoint: null,
      })),
  );

  const responses = await Promise.all(available);

  let maxBlock = 0;
  let endpointsMap = new Map<number, string[]>();

  for (const response of responses) {
    if (response.block) {
      maxBlock = Math.max(maxBlock, response.block);
      endpointsMap.set(
        response.block,
        (endpointsMap.get(response.block) ?? []).concat(response.endpoint),
      );
    }
  }

  if (maxBlock === 0) {
    return null;
  }
  const blockEndpoints = endpointsMap.get(maxBlock) ?? [];
  return blockEndpoints[Math.floor(Math.random() * blockEndpoints.length)];
}
