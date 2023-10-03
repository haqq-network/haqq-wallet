import {useEffect, useState} from 'react';

import {app} from '@app/contexts';
import {Events} from '@app/events';
import {sumReduce} from '@app/helpers/staking';
import {
  StakingMetadata,
  StakingMetadataType,
} from '@app/models/staking-metadata';
import {Balance} from '@app/services/balance';

/**
 * @description Hook to get staking rewards and sum all rewards
 */
export function useStakingReward() {
  const [rewardAmount, setRewardAmount] = useState(Balance.Empty);

  useEffect(() => {
    const rows = StakingMetadata.getAll();

    const listener = () => {
      const rewards = rows.filter(
        val => val.type === StakingMetadataType.reward,
      );
      const rewardsSum = new Balance(sumReduce(rewards));

      setRewardAmount(rewardsSum);
    };

    rows.addListener(listener);
    app.addListener(Events.onBalanceSync, listener);
    return () => {
      rows.removeListener(listener);
      app.removeListener(Events.onBalanceSync, listener);
    };
  }, []);

  return rewardAmount;
}
