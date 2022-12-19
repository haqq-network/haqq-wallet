import {I18N, getText} from '@app/i18n';
import {StakingMetadata} from '@app/models/staking-metadata';

export function reduceAmounts(data: StakingMetadata[]) {
  return data.reduce((sum, item) => sum + item.amount, 0);
}

export function formatStakingDate(date?: string) {
  const curDate = Date.now();
  const days = Math.ceil((new Date(date ?? 0).getTime() - curDate) / 86400000);
  return getText(
    days > 1
      ? I18N.StakingInfoUnDelegationDays
      : I18N.StakingInfoUnDelegationDay,
    {days: String(days)},
  );
}

export function sumReduce(
  stakingData: (StakingMetadata & Realm.Object<unknown, never>)[],
) {
  return stakingData.reduce((acc, val) => acc + val.amount, 0);
}
