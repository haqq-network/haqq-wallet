import {onCheckAvailability} from '@app/event-actions/on-check-availability';
import {onStakingSync} from '@app/event-actions/on-staking-sync';
import {onVestingSync} from '@app/event-actions/on-vesting-sync';
import {onWalletsBalanceCheck} from '@app/event-actions/on-wallets-balance-check';

export async function onProviderChanged() {
  await onCheckAvailability();
  await Promise.all([
    onWalletsBalanceCheck(),
    onStakingSync(),
    onVestingSync(),
  ]);
}
