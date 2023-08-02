import {onCheckAvailability} from '@app/event-actions/on-check-availability';
import {onStakingSync} from '@app/event-actions/on-staking-sync';
import {onWalletsBalanceCheck} from '@app/event-actions/on-wallets-balance-check';

export async function onProviderChanged() {
  await onCheckAvailability();
  await onWalletsBalanceCheck();
  await onStakingSync();
}
