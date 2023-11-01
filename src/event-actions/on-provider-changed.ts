import {app} from '@app/contexts';
import {onCheckAvailability} from '@app/event-actions/on-check-availability';
import {Events} from '@app/events';
import {awaitForEventDone} from '@app/helpers/await-for-event-done';

export async function onProviderChanged() {
  await awaitForEventDone(Events.onTesterModeChanged, app.isTesterMode);
  await onCheckAvailability();
  await awaitForEventDone(Events.onSyncAppBalances);
}
