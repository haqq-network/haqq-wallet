import {Balance, MIN_STAKING_REWARD} from '@app/services/balance';
import {RemoteConfig} from '@app/services/remote-config';

export const getMinStakingRewardAmount = () => {
  const remoteMinAmount = RemoteConfig.get('staking_reward_min_amount');

  if (remoteMinAmount) {
    return new Balance(remoteMinAmount);
  }

  return MIN_STAKING_REWARD;
};
