import React, {useCallback, useEffect, useRef} from 'react';

import {HomeStaking} from '@app/components/home-staking';
import {
  useApp,
  useTypedNavigation,
  useValidators,
  useWalletsList,
} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {StakingMetadata} from '@app/models/staking-metadata';
import {Cosmos} from '@app/services/cosmos';

export const HomeStakingScreen = () => {
  const app = useApp();

  const {visible} = useWalletsList();
  const navigation = useTypedNavigation();
  const {loading, stakingSum, rewardsSum, unDelegationSum} = useValidators();
  const cosmos = useRef(new Cosmos(app.provider!)).current;
  const {stakedValidators} = useValidators({withValidatorLists: true});
  const onPressValidators = useCallback(() => {
    navigation.navigate('stakingValidators');
  }, [navigation]);

  const onPressGetRewards = useCallback(() => {
    const rewards: Realm.Results<StakingMetadata>[] = stakedValidators.map(
      ({operator_address}) => {
        return StakingMetadata.getRewardsForValidator(operator_address);
      },
    );
    rewards.forEach(rewardItem => {
      if (rewardItem.length) {
        const delegators = new Set(rewardItem.map(r => r.delegator));

        Promise.all(
          visible
            .filter(w => delegators.has(w.cosmosAddress))
            .map(w =>
              cosmos.multipleWithdrawDelegatorReward(
                w.address,
                stakedValidators.map(v => v.operator_address),
              ),
            )
            .flat(),
        ).then(() => {
          rewardItem.forEach(r => StakingMetadata.remove(r.hash));
        });
      }
    });
    app.emit('notification', getText(I18N.notificationRewardReceived));
  }, [cosmos, stakedValidators, visible, app]);

  useEffect(() => {
    const addressList = visible.map(w => w.cosmosAddress);

    cosmos.sync(addressList);
  }, [cosmos, visible]);

  return (
    <HomeStaking
      loading={loading}
      stakingSum={stakingSum}
      rewardsSum={rewardsSum}
      unDelegationSum={unDelegationSum}
      onPressGetRewards={onPressGetRewards}
      onPressValidators={onPressValidators}
    />
  );
};
