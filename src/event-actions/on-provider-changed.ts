import {onCheckAvailability} from '@app/event-actions/on-check-availability';
import {Events} from '@app/events';
import {awaitForEventDone} from '@app/helpers/await-for-event-done';

export async function onProviderChanged() {
  await onCheckAvailability();
  await awaitForEventDone(Events.onSyncAppBalances);
}
