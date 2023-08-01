import {app} from '@app/contexts';

export async function onCheckAvailability() {
  const provider = app.provider;

  if (provider && provider.evmEndpoints.length > 0) {
    const available = provider.evmEndpoints.map(endpoint =>
      runWithTimeout<{result: string}>(
        fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'eth_blockNumber',
            params: [],
          }),
        }).then(response => response.json()),
      )
        .then(data => ({
          block: parseInt(data.result, 16),
          endpoint,
        }))
        .catch(() => ({
          block: null,
          endpoint: null,
        })),
    );

    const responses = await Promise.all(available);

    let maxBlock = 0;
    let endpoints = new Map<number, string[]>();

    for (const response of responses) {
      if (response.block) {
        maxBlock = Math.max(maxBlock, response.block);
        endpoints.set(
          response.block,
          (endpoints.get(response.block) ?? []).concat(response.endpoint),
        );
      }
    }

    if (maxBlock > 0) {
      let blockEndpoints = endpoints.get(maxBlock) ?? [];

      if (blockEndpoints.length > 0) {
        provider.setEvmEndpoint(
          blockEndpoints[Math.floor(Math.random() * blockEndpoints.length)],
        );
      }
    }
  }
}

export async function runWithTimeout<T>(
  action: Promise<any>,
  timeout = 15000,
): Promise<T> {
  return Promise.race([
    action,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), timeout),
    ),
  ]);
}
