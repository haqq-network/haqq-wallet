import {onStakingSync} from '@app/event-actions/on-staking-sync';
import {onWalletsBalanceCheck} from '@app/event-actions/on-wallets-balance-check';

export async function onProviderChanged() {
  await onWalletsBalanceCheck();
  await onStakingSync();
}
