import {useEffect, useState} from 'react';

import {autorun} from 'mobx';

import {reduceAmounts} from '@app/helpers/staking';
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
    const rewards = StakingMetadata.getAllByType(StakingMetadataType.reward);

    const listener = () => {
      const rewardsSum = new Balance(reduceAmounts(rewards));
      setRewardAmount(rewardsSum);
    };

    const disposer = autorun(listener);

    return () => {
      disposer();
    };
  }, []);

  return rewardAmount;
}
