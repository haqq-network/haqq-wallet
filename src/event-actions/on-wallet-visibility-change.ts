import {Events} from '@app/events';
import {awaitForEventDone} from '@app/helpers/await-for-event-done';

export async function onWalletVisibilityChange() {
  await awaitForEventDone(Events.onSyncAppBalances);
}
