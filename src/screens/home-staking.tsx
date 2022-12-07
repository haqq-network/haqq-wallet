import React, {useCallback, useEffect, useState} from 'react';

import {HomeStaking} from '@app/components/home-staking';
import {useCosmos, useTypedNavigation, useWalletsList} from '@app/hooks';
import {
  StakingMetadata,
  StakingMetadataType,
} from '@app/models/staking-metadata';

const initData = {
  stakingSum: 0,
  rewardsSum: 0,
  unDelegationSum: 0,
  loading: true,
};

export const HomeStakingScreen = () => {
  const [data, setData] = useState(initData);

  const {visible} = useWalletsList();
  const navigation = useTypedNavigation();
  const cosmos = useCosmos();

  const onPressValidators = useCallback(() => {
    navigation.navigate('stakingValidators');
  }, [navigation]);

  useEffect(() => {
    const listener = (newData: any) => {
      setData({...newData, loading: false});
    };
    const unsub = StakingMetadata.getAll().addListener(
      StakingMetadata.summaryInfoListener(listener),
    );
    return unsub;
  }, []);

  const onPressGetRewards = useCallback(async () => {
    const stakedValidators = StakingMetadata.getAll();
    const rewards: Realm.Results<StakingMetadata> = stakedValidators.filtered(
      `type = '${StakingMetadataType.reward}'`,
    );

    const delegators: any = {};

    for (const row of rewards) {
      delegators[row.delegator] = (delegators[row.delegator] ?? []).concat(
        row.validator,
      );
    }
    await Promise.all(
      visible
        .filter(w => w.cosmosAddress in delegators)
        .map(w => {
          return cosmos.multipleWithdrawDelegatorReward(
            w.address,
            delegators[w.cosmosAddress],
          );
        }),
    );
    rewards.forEach(r => StakingMetadata.remove(r.hash));
  }, [cosmos, visible]);

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
