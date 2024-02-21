import {EthRpcEndpointAvailability} from '@app/helpers/eth-rpc-endpoint-availability';
import {Currencies} from '@app/models/currencies';
import {RemoteConfig} from '@app/services/remote-config';

/**
 * @description Called first when the app is initialized. Load remote config and check availability endpoints.
 */
export async function onAppInitialized() {
  await RemoteConfig.init();
  Currencies.setSelectedCurrency(
    Currencies.selectedCurrency || RemoteConfig.get('currency')?.id,
  );
  EthRpcEndpointAvailability.checkEthRpcEndpointAvailability();
}
