import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {useFocusEffect} from '@react-navigation/native';

import {HomeEarn} from '@app/components/home-earn';
import {Loading} from '@app/components/ui';
import {app} from '@app/contexts';
import {onEarnGetTicket} from '@app/event-actions/on-earn-get-ticket';
import {onStakingRewards} from '@app/event-actions/on-staking-rewards';
import {onTrackEvent} from '@app/event-actions/on-track-event';
import {Events} from '@app/events';
import {getUid} from '@app/helpers/get-uid';
import {sumReduce} from '@app/helpers/staking';
import {useTypedNavigation, useWalletsVisible} from '@app/hooks';
import {
  StakingMetadata,
  StakingMetadataType,
} from '@app/models/staking-metadata';
import {Wallet} from '@app/models/wallet';
import {Backend} from '@app/services/backend';
import {Balance} from '@app/services/balance';
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
      (acc, w) => acc.operate(app.getBalance(w?.address), 'add'),
      Balance.Empty,
    ),
  });

  const canGetRewards = useMemo(
    () => data.rewardsSum >= 1 / NUM_PRECISION,
    [data],
  );

  const haveAvailableSum = useMemo(
    () => data.availableSum.toNumber() >= 1 / NUM_PRECISION,
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
        (acc, w) => acc.operate(app.getBalance(w?.address), 'add'),
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

  const loadRaffles = useCallback(async (isInitialCall = false) => {
    try {
      !isInitialCall && setIsRafflesLoading(true);
      let uid = await getUid();
      const response = await Backend.instance.contests(
        Wallet?.addressList(),
        uid,
      );
      setRaffles(response.sort((a, b) => b.start_at - a.start_at));
    } catch (err) {
      Logger.captureException(
        err,
        'HomeEarnScreen.loadRaffles',
        Wallet?.addressList(),
      );
    }
    !isInitialCall && setIsRafflesLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadRaffles(true);

      app.on(Events.onRaffleTicket, loadRaffles);

      return () => {
        app.off(Events.onRaffleTicket, loadRaffles);
      };
    }, [loadRaffles]),
  );

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
      Logger.captureException(e, 'onPressGetTicket');
      throw e;
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
          .reduce(
            (prev, curr) =>
              prev +
              (parseInt(curr.budget, 16) / WEI / curr.winners) *
                curr.winner_tickets,
            0,
          ) || 0;

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
