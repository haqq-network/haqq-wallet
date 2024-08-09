import {Events} from '@app/events';
import {awaitForEventDone} from '@app/helpers/await-for-event-done';

// import {onStakingSync} from './on-staking-sync';
// import {onVestingSync} from './on-vesting-sync';

export async function onSyncAppBalances() {
  try {
    return await awaitForEventDone(Events.onWalletsBalanceCheck);
    // await Promise.all([
    // onVestingSync(),
    // onStakingSync(),
    // ]);
  } catch (err) {
    Logger.captureException(err, Events.onSyncAppBalances);
  }
}
