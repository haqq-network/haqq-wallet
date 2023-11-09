import {EthRpcEndpointAvailability} from '@app/helpers/eth-rpc-endpoint-availability';
import {RemoteConfig} from '@app/services/remote-config';

/**
 * @description Called first when the app is initialized. Load remote config and check availability endpoints.
 */
export async function onAppInitialized() {
  RemoteConfig.init();
  EthRpcEndpointAvailability.checkEthRpcEndpointAvailability();
}
