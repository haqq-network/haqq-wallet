import {app} from '@app/contexts';
import {getAvailableEndpoint} from '@app/helpers/get-available-endpoint';

export async function onCheckAvailability() {
  const provider = app.provider;

  if (provider && provider.evmEndpoints.length > 0) {
    const newEndpoint = await getAvailableEndpoint(provider.evmEndpoints);

    if (newEndpoint) {
      provider.setEvmEndpoint(newEndpoint);
    }
  }
}
