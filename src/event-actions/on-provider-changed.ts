import {app} from '@app/contexts';
import {Events} from '@app/events';
import {awaitForEventDone} from '@app/helpers/await-for-event-done';
import {EthRpcEndpointAvailability} from '@app/helpers/eth-rpc-endpoint-availability';

export async function onProviderChanged() {
  await awaitForEventDone(Events.onTesterModeChanged, app.isTesterMode);
  await EthRpcEndpointAvailability.checkEthRpcEndpointAvailability();
  await awaitForEventDone(Events.onSyncAppBalances);
}
