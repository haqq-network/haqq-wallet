import React, {useCallback, useEffect, useRef, useState} from 'react';

import {RouteProp, useRoute} from '@react-navigation/native';

import {StakingInfo} from '@app/components/staking-info';
import {app} from '@app/contexts';
import {useTypedNavigation, useWallets} from '@app/hooks';
import {StakingMetadata} from '@app/models/staking-metadata';
import {Cosmos} from '@app/services/cosmos';
import {RootStackParamList} from '@app/types';

export const StakingInfoScreen = () => {
  const wallets = useWallets();
  const route = useRoute<RouteProp<RootStackParamList, 'stakingInfo'>>();
  const navigation = useTypedNavigation();
  const [withdrawDelegatorRewardProgress, setWithdrawDelegatorRewardProgress] =
    useState(false);
  const cosmos = useRef(new Cosmos(app.provider!)).current;
  const [rewards, setRewards] = useState<Realm.Results<StakingMetadata> | null>(
    null,
  );

  useEffect(() => {
    const r = StakingMetadata.getRewardsForValidator(
      route.params.validator.operator_address,
    );

    const subscription = () => {
      setRewards(
        StakingMetadata.getRewardsForValidator(
          route.params.validator.operator_address,
        ),
      );
    };

    r.addListener(subscription);
    setRewards(r);
    return () => {
      r.removeListener(subscription);
    };
  }, [route.params.validator.operator_address]);

  const onWithdrawDelegatorReward = useCallback(() => {
    if (rewards?.length) {
      setWithdrawDelegatorRewardProgress(true);
      const delegators = new Set(rewards.map(r => r.delegator));

      Promise.all(
        wallets.visible
          .filter(w => delegators.has(w.cosmosAddress))
          .map(w =>
            cosmos.withdrawDelegatorReward(
              w.address,
              route.params.validator.operator_address,
            ),
          ),
      )
        .then((...resp) => {
          console.log(JSON.stringify(resp));
          rewards.forEach(r => StakingMetadata.remove(r.hash));
        })
        .finally(() => {
          setWithdrawDelegatorRewardProgress(false);
        });
    }
  }, [cosmos, rewards, route.params.validator.operator_address, wallets]);

  const onDelegate = useCallback(() => {
    navigation.push('stakingDelegate', {
      validator: route.params.validator.operator_address,
    });
  }, [navigation, route.params.validator.operator_address]);

  const onUnDelegate = useCallback(() => {
    navigation.push('stakingUnDelegate', {
      validator: route.params.validator.operator_address,
    });
  }, [navigation, route.params.validator.operator_address]);

  const delegated = StakingMetadata.getDelegationsForValidator(
    route.params.validator.operator_address,
  );

  return (
    <StakingInfo
      withdrawDelegatorRewardProgress={withdrawDelegatorRewardProgress}
      validator={route.params.validator}
      onDelegate={onDelegate}
      onUnDelegate={onUnDelegate}
      onWithdrawDelegatorReward={onWithdrawDelegatorReward}
      delegations={delegated}
      rewards={rewards}
    />
  );
};
