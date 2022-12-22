import React, {useCallback, useEffect, useState} from 'react';

import {HomeStaking} from '@app/components/home-staking';
import {app} from '@app/contexts';
import {Events} from '@app/events';
import {sumReduce} from '@app/helpers/staking';
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
  const {visible} = useWalletsList();

  const [data, setData] = useState({
    ...initData,
    availableSum: visible.reduce((acc, w) => acc + w.balance, 0),
  });
  const navigation = useTypedNavigation();
  const cosmos = useCosmos();

  const onPressValidators = useCallback(() => {
    navigation.navigate('stakingValidators');
  }, [navigation]);

  useEffect(() => {
    const rows = StakingMetadata.getAll();

    const listener = () => {
      const rewards = rows.filter(
        val => val.type === StakingMetadataType.reward,
      );
      const delegations = rows.filter(
        val => val.type === StakingMetadataType.delegation,
      );
      const unDelegations = rows.filter(
        val => val.type === StakingMetadataType.undelegation,
      );

      const rewardsSum = sumReduce(rewards);
      const stakingSum = sumReduce(delegations);
      const unDelegationSum = sumReduce(unDelegations);
      const availableSum = visible.reduce((acc, w) => acc + w.balance, 0);
      setData({
        rewardsSum,
        stakingSum,
        unDelegationSum,
        availableSum,
        loading: false,
      });
    };

    rows.addListener(listener);
    app.addListener('balance', listener);
    return () => {
      rows.removeListener(listener);
      app.removeListener('balance', listener);
    };
  }, [visible]);

  const onPressGetRewards = useCallback(async () => {
    const rewards = StakingMetadata.getAllByType(StakingMetadataType.reward);

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
            w.transport,
            delegators[w.cosmosAddress],
          );
        }),
    );
    rewards.forEach(r => StakingMetadata.remove(r.hash));
  }, [cosmos, visible]);

  useEffect(() => {
    const sync = () => {
      app.emit(Events.onStakingSync);
    };

    app.emit(Events.onStakingSync);

    const interval = setInterval(sync, 15000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    return () => {
      visible.map(w => w.transportExists && w.transport.abort());
    };
  }, [visible]);

  return (
    <HomeStaking
      loading={data.loading}
      availableSum={data.availableSum}
      stakingSum={data.stakingSum}
      rewardsSum={data.rewardsSum}
      unDelegationSum={data.unDelegationSum}
      onPressGetRewards={onPressGetRewards}
      onPressValidators={onPressValidators}
    />
  );
};
