import React, {useCallback, useEffect, useRef, useState} from 'react';

import {StakingInfo} from '@app/components/staking-info';
import {app} from '@app/contexts';
import {useTypedNavigation, useTypedRoute, useWallets} from '@app/hooks';
import {StakingMetadata} from '@app/models/staking-metadata';
import {Cosmos} from '@app/services/cosmos';

type rewardsStateType = Realm.Results<StakingMetadata> | null;

export const StakingInfoScreen = () => {
  const wallets = useWallets();
  const cosmos = useRef(new Cosmos(app.provider!)).current;

  const {validator} = useTypedRoute<'stakingInfo'>().params;
  const {operator_address} = validator;

  const navigation = useTypedNavigation();

  const [withdrawDelegatorRewardProgress, setWithdrawDelegatorRewardProgress] =
    useState(false);
  const [rewards, setRewards] = useState<rewardsStateType>(null);

  useEffect(() => {
    const r = StakingMetadata.getRewardsForValidator(operator_address);

    const subscription = () => {
      setRewards(StakingMetadata.getRewardsForValidator(operator_address));
    };

    r.addListener(subscription);
    setRewards(r);
    return () => {
      r.removeListener(subscription);
    };
  }, [operator_address]);

  const onWithdrawDelegatorReward = useCallback(() => {
    if (rewards?.length) {
      setWithdrawDelegatorRewardProgress(true);
      const delegators = new Set(rewards.map(r => r.delegator));

      Promise.all(
        wallets.visible
          .filter(w => delegators.has(w.cosmosAddress))
          .map(w =>
            cosmos.withdrawDelegatorReward(w.address, operator_address),
          ),
      )
        .then(() => {
          rewards.forEach(r => StakingMetadata.remove(r.hash));
        })
        .finally(() => {
          setWithdrawDelegatorRewardProgress(false);
        });
    }
  }, [cosmos, rewards, operator_address, wallets]);

  const onDelegate = useCallback(() => {
    navigation.push('stakingDelegate', {
      validator: operator_address,
    });
  }, [navigation, operator_address]);

  const onUnDelegate = useCallback(() => {
    navigation.push('stakingUnDelegate', {
      validator: operator_address,
    });
  }, [navigation, operator_address]);

  const delegated =
    StakingMetadata.getDelegationsForValidator(operator_address);

  return (
    <StakingInfo
      withdrawDelegatorRewardProgress={withdrawDelegatorRewardProgress}
      validator={validator}
      onDelegate={onDelegate}
      onUnDelegate={onUnDelegate}
      onWithdrawDelegatorReward={onWithdrawDelegatorReward}
      delegations={delegated}
      rewards={rewards}
    />
  );
};
