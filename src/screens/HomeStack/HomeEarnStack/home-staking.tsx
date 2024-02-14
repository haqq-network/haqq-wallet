import React, {useCallback, useEffect, useState} from 'react';

import {autorun} from 'mobx';
import {observer} from 'mobx-react';

import {HomeStaking} from '@app/components/home-staking';
import {app} from '@app/contexts';
import {onStakingRewards} from '@app/event-actions/on-staking-rewards';
import {onTrackEvent} from '@app/event-actions/on-track-event';
import {Events} from '@app/events';
import {abortProviderInstanceForWallet} from '@app/helpers/provider-instance';
import {reduceAmounts} from '@app/helpers/staking';
import {useTypedNavigation} from '@app/hooks';
import {
  StakingMetadata,
  StakingMetadataType,
} from '@app/models/staking-metadata';
import {Wallet} from '@app/models/wallet';
import {HomeEarnStackParamList, HomeEarnStackRoutes} from '@app/route-types';
import {Balance} from '@app/services/balance';
import {AdjustEvents} from '@app/types';

const initData = {
  stakingSum: Balance.Empty,
  rewardsSum: Balance.Empty,
  unDelegationSum: Balance.Empty,
  loading: true,
};

export const HomeStakingScreen = observer(() => {
  const visible = Wallet.getAllVisible();

  const [data, setData] = useState({
    ...initData,
    availableSum: visible.reduce(
      (acc, w) => acc.operate(app.getAvailableBalance(w.address), 'add'),
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
    const rewards = StakingMetadata.getAllByType(StakingMetadataType.reward);
    const delegations = StakingMetadata.getAllByType(
      StakingMetadataType.delegation,
    );
    const unDelegations = StakingMetadata.getAllByType(
      StakingMetadataType.undelegation,
    );
    const visibleWallets = Wallet.getAllVisible();

    const listener = () => {
      const rewardsSum = new Balance(reduceAmounts(rewards));
      const stakingSum = new Balance(reduceAmounts(delegations));
      const unDelegationSum = new Balance(reduceAmounts(unDelegations));
      const availableSum = visibleWallets.reduce(
        (acc, w) =>
          acc.operate(app.getAvailableForStakeBalance(w.address), 'add'),
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

    const disposer = autorun(listener);
    app.addListener(Events.onBalanceSync, listener);
    return () => {
      disposer();
      app.removeListener(Events.onBalanceSync, listener);
    };
  }, []);

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
  }, []);

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
