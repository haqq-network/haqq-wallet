import {Provider} from '@app/models/provider';
import {Backend} from '@app/services/backend';
import {RemoteConfig} from '@app/services/remote-config';

export async function onRemoteConfigSync() {
  try {
    if (RemoteConfig.isInited) {
      return;
    }

    const config = await Backend.instance.getRemoteConfig();

    if (Object.keys(config).length) {
      RemoteConfig.set(config);

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
    } else {
      Logger.error('🔴 [RemoteConfig]: remote config is empty', config);
    }
  } catch (err) {
    Logger.error('🔴 [RemoteConfig]: failed to fetch remote config', err);
  }
}
