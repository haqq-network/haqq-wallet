import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {HomeEarn} from '@app/components/home-earn';
import {Loading} from '@app/components/ui';
import {app} from '@app/contexts';
import {onEarnGetTicket} from '@app/event-actions/on-earn-get-ticket';
import {onStakingRewards} from '@app/event-actions/on-staking-rewards';
import {onTrackEvent} from '@app/event-actions/on-track-event';
import {Events} from '@app/events';
import {captureException} from '@app/helpers';
import {getUid} from '@app/helpers/get-uid';
import {sumReduce} from '@app/helpers/staking';
import {useTypedNavigation, useWalletsVisible} from '@app/hooks';
import {
  StakingMetadata,
  StakingMetadataType,
} from '@app/models/staking-metadata';
import {Wallet} from '@app/models/wallet';
import {Backend} from '@app/services/backend';
import {AdjustEvents, Raffle, RaffleStatus} from '@app/types';
import {NUM_PRECISION, WEI} from '@app/variables/common';

const initData = {
  stakingSum: 0,
  rewardsSum: 0,
  unDelegationSum: 0,
  loading: true,
};

export const HomeEarnScreen = () => {
  const navigation = useTypedNavigation();
  const visible = useWalletsVisible();
  const [raffles, setRaffles] = useState<null | Raffle[]>(null);
  const [isRafflesLoading, setIsRafflesLoading] = useState<boolean>(false);

  const [data, setData] = useState({
    ...initData,
    availableSum: visible.reduce(
      (acc, w) => acc + app.getBalance(w.address),
      0,
    ),
  });

  const canGetRewards = useMemo(
    () => data.rewardsSum >= 1 / NUM_PRECISION,
    [data],
  );

  const haveAvailableSum = useMemo(
    () => data.availableSum >= 1 / NUM_PRECISION,
    [data],
  );

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
      const availableSum = visible.reduce(
        (acc, w) => acc + app.getBalance(w.address),
        0,
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
    app.addListener('balance', listener);
    return () => {
      rows.removeListener(listener);
      app.removeListener('balance', listener);
    };
  }, [visible]);

  const loadRaffles = useCallback(async () => {
    try {
      setIsRafflesLoading(true);
      let uid = await getUid();
      const response = await Backend.instance.contests(
        Wallet.addressList(),
        uid,
      );
      setRaffles(response.sort((a, b) => b.start_at - a.start_at));
    } catch (err) {
      captureException(err, 'HomeEarnScreen.loadRaffles', Wallet.addressList());
    }
    setIsRafflesLoading(false);
  }, []);

  useEffect(() => {
    loadRaffles();

    app.on(Events.onRaffleTicket, loadRaffles);

    return () => {
      app.off(Events.onRaffleTicket, loadRaffles);
    };
  }, [loadRaffles]);

  useEffect(() => {
    onTrackEvent(AdjustEvents.earnOpen);
  }, []);

  const onPressStaking = useCallback(() => {
    navigation.navigate('staking');
  }, [navigation]);

  const onPressGetTicket = useCallback(async (raffle: Raffle) => {
    try {
      await onEarnGetTicket(raffle.id);
    } catch (e) {
      captureException(e, 'onPressGetTicket');
    }
  }, []);
  const onPressShowResult = useCallback(
    (raffle: Raffle) => {
      navigation.navigate('raffleReward', {item: raffle});
    },
    [navigation],
  );
  const onPressRaffle = useCallback(
    (raffle: Raffle) => {
      if (raffle.status === 'closed') {
        navigation.navigate('raffleReward', {item: raffle});
        return;
      }

      const prevIslmCount =
        raffles
          ?.filter?.(it => it.status === RaffleStatus.closed)
          .reduce((prev, curr) => prev + parseInt(curr.budget, 16) / WEI, 0) ||
        0;

      const prevTicketsCount =
        raffles
          ?.filter?.(it => it.status === RaffleStatus.closed)
          .reduce((prev, curr) => prev + curr.winner_tickets, 0) || 0;

      navigation.navigate('raffleDetails', {
        item: raffle,
        prevIslmCount,
        prevTicketsCount,
      });
    },
    [navigation, raffles],
  );

  if (raffles === null) {
    return <Loading />;
  }

  return (
    <HomeEarn
      rewardAmount={data.rewardsSum}
      showStakingRewards={haveAvailableSum}
      showStakingGetRewardsButtons={canGetRewards}
      raffleList={raffles}
      isRafflesLoading={isRafflesLoading}
      loadRaffles={loadRaffles}
      onPressGetRewards={onStakingRewards}
      onPressGetTicket={onPressGetTicket}
      onPressShowResult={onPressShowResult}
      onPressStaking={onPressStaking}
      onPressRaffle={onPressRaffle}
    />
  );
};
