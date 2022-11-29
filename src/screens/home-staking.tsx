import React, {useCallback, useEffect, useRef, useState} from 'react';

import {HomeStaking} from '@app/components/home-staking';
import {useApp, useTypedNavigation, useWalletsList} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {StakingMetadata} from '@app/models/staking-metadata';
import {Cosmos} from '@app/services/cosmos';

const initData = {
  stakingSum: 0,
  rewardsSum: 0,
  unDelegationSum: 0,
  loading: true,
};

export const HomeStakingScreen = () => {
  const app = useApp();
  const [data, setData] = useState(initData);

  const {visible} = useWalletsList();
  const navigation = useTypedNavigation();
  const cosmos = useRef(new Cosmos(app.provider!)).current;

  const onPressValidators = useCallback(() => {
    navigation.navigate('stakingValidators');
  }, [navigation]);

  useEffect(() => {
    const newData = StakingMetadata.getSummaryInfo();
    setData({...newData, loading: false});
  }, []);

  const onPressGetRewards = useCallback(() => {
    const stakedValidators = StakingMetadata.getAll();
    const rewards: Realm.Results<StakingMetadata>[] = stakedValidators.map(
      ({operator_address}: any) => {
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
                stakedValidators.map(v => v.validator),
              ),
            )
            .flat(),
        ).then(() => {
          rewardItem.forEach(r => StakingMetadata.remove(r.hash));
        });
      }
    });
    app.emit('notification', getText(I18N.notificationRewardReceived));
  }, [cosmos, visible, app]);

  useEffect(() => {
    const addressList = visible.map(w => w.cosmosAddress);

    cosmos.sync(addressList);
  }, [cosmos, visible]);

  return (
    <HomeStaking
      loading={data.loading}
      stakingSum={data.stakingSum}
      rewardsSum={data.rewardsSum}
      unDelegationSum={data.unDelegationSum}
      onPressGetRewards={onPressGetRewards}
      onPressValidators={onPressValidators}
    />
  );
};
