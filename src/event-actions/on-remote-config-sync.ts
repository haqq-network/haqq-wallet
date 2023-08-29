import {Provider} from '@app/models/provider';
import {RemoteConfig} from '@app/services/remote-config';

const logger = Logger.create('onRemoteConfigSync', {
  stringifyJson: true,
});

export async function onRemoteConfigSync() {
  try {
    if (RemoteConfig.isInited) {
      return;
    }

    const config = await RemoteConfig.init();

    if (config) {
      if (config.evm_endpoints) {
        for (const [chainId, endpoints] of Object.entries(
          config.evm_endpoints,
        )) {
          if (endpoints.length > 0) {
            const providers = Provider.getByCosmosChainId(chainId);

            for (const provider of providers) {
              provider.update({
                evmEndpoints: endpoints,
              });
            }
          }
        }
      }

      if (config.tm_endpoints) {
        for (const [chainId, endpoints] of Object.entries(
          config.tm_endpoints,
        )) {
          if (endpoints.length > 0) {
            const providers = Provider.getByCosmosChainId(chainId);

            for (const provider of providers) {
              provider.update({
                tmEndpoints: endpoints,
              });
            }
          }
        }
      }

      if (config.indexer_endpoints) {
        for (const [chainId, endpoints] of Object.entries(
          config.indexer_endpoints,
        )) {
          if (endpoints.length > 0) {
            const providers = Provider.getByCosmosChainId(chainId);

            for (const provider of providers) {
              provider.update({
                indexer: endpoints,
              });
            }
          }
        }
      }
    } else {
      logger.error('remote config is empty', config);
    }
  } catch (err) {
    logger.error('failed to fetch remote config', err);
  }
}
