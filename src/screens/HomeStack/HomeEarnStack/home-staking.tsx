import React, {memo, useCallback, useEffect, useState} from 'react';

import {HomeStaking} from '@app/components/home-staking';
import {app} from '@app/contexts';
import {onStakingRewards} from '@app/event-actions/on-staking-rewards';
import {onTrackEvent} from '@app/event-actions/on-track-event';
import {Events} from '@app/events';
import {abortProviderInstanceForWallet} from '@app/helpers/provider-instance';
import {sumReduce} from '@app/helpers/staking';
import {useTypedNavigation} from '@app/hooks';
import {useWalletsVisible} from '@app/hooks/use-wallets-visible';
import {
  StakingMetadata,
  StakingMetadataType,
} from '@app/models/staking-metadata';
import {
  HomeEarnStackParamList,
  HomeEarnStackRoutes,
} from '@app/screens/HomeStack/HomeEarnStack';
import {Balance} from '@app/services/balance';
import {AdjustEvents} from '@app/types';

const initData = {
  stakingSum: Balance.Empty,
  rewardsSum: Balance.Empty,
  unDelegationSum: Balance.Empty,
  loading: true,
};

export const HomeStakingScreen = memo(() => {
  const visible = useWalletsVisible();

  const [data, setData] = useState({
    ...initData,
    availableSum: visible.reduce(
      (acc, w) => acc.operate(app.getBalance(w.address), 'add'),
      Balance.Empty,
    ),
  });
  const navigation = useTypedNavigation<HomeEarnStackParamList>();

  const onPressValidators = useCallback(() => {
    navigation.navigate(HomeEarnStackRoutes.StakingValidators);
  }, [navigation]);

  useEffect(() => {
    onTrackEvent(AdjustEvents.stakingOpen);
  }, []);

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

      const rewardsSum = new Balance(sumReduce(rewards));
      const stakingSum = new Balance(sumReduce(delegations));
      const unDelegationSum = new Balance(sumReduce(unDelegations));
      const availableSum = visible.reduce(
        (acc, w) => acc.operate(app.getBalance(w.address), 'add'),
        Balance.Empty,
      );

      setData({
        rewardsSum,
        stakingSum,
        unDelegationSum,
        availableSum,
        loading: false,
      });
    };

    rows.addListener(listener);
    app.addListener(Events.onBalanceSync, listener);
    return () => {
      rows.removeListener(listener);
      app.removeListener(Events.onBalanceSync, listener);
    };
  }, [visible]);

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
      visible.map(w => abortProviderInstanceForWallet(w));
    };
  }, [visible]);

  return (
    <HomeStaking
      loading={data.loading}
      availableSum={data.availableSum}
      stakingSum={data.stakingSum}
      rewardsSum={data.rewardsSum}
      unDelegationSum={data.unDelegationSum}
      onPressGetRewards={onStakingRewards}
      onPressValidators={onPressValidators}
    />
  );
});
