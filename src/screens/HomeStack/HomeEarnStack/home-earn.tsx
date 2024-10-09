import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {useFocusEffect} from '@react-navigation/native';
import {autorun} from 'mobx';
import {observer} from 'mobx-react';

import {HomeEarn} from '@app/components/home-earn';
import {Loading} from '@app/components/ui';
import {app} from '@app/contexts';
import {onEarnGetTicket} from '@app/event-actions/on-earn-get-ticket';
import {onStakingRewards} from '@app/event-actions/on-staking-rewards';
import {Events} from '@app/events';
import {getUid} from '@app/helpers/get-uid';
import {prepareRaffles} from '@app/helpers/prepare-raffles';
import {reduceAmounts} from '@app/helpers/staking';
import {useTypedNavigation} from '@app/hooks';
import {
  StakingMetadata,
  StakingMetadataType,
} from '@app/models/staking-metadata';
import {Wallet} from '@app/models/wallet';
import {HomeEarnStackParamList, HomeEarnStackRoutes} from '@app/route-types';
import {Backend} from '@app/services/backend';
import {Balance} from '@app/services/balance';
import {EventTracker} from '@app/services/event-tracker';
import {MarketingEvents, Raffle, RaffleStatus} from '@app/types';
import {NUM_PRECISION, WEI} from '@app/variables/common';

const initData = {
  stakingSum: 0,
  rewardsSum: 0,
  unDelegationSum: 0,
  loading: true,
};

export const HomeEarnScreen = observer(() => {
  const navigation = useTypedNavigation<HomeEarnStackParamList>();
  const visible = Wallet.getAllVisible();
  const [raffles, setRaffles] = useState<null | Raffle[]>(null);
  const [isRafflesLoading, setIsRafflesLoading] = useState<boolean>(false);

  const [data, setData] = useState({
    ...initData,
    availableSum: visible.reduce(
      (acc, w) => acc.operate(Wallet.getBalance(w.address, 'available'), 'add'),
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
    const rewards = StakingMetadata.getAllByType(StakingMetadataType.reward);
    const delegations = StakingMetadata.getAllByType(
      StakingMetadataType.delegation,
    );
    const unDelegations = StakingMetadata.getAllByType(
      StakingMetadataType.undelegation,
    );

    const listener = () => {
      const rewardsSum = reduceAmounts(rewards);
      const stakingSum = reduceAmounts(delegations);
      const unDelegationSum = reduceAmounts(unDelegations);
      const availableSum = visible.reduce(
        (acc, w) =>
          acc.operate(Wallet.getBalance(w.address, 'available'), 'add'),
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

    return () => {
      disposer();
    };
  }, [visible]);

  const loadRaffles = useCallback(async (isInitialCall = false) => {
    try {
      !isInitialCall && setIsRafflesLoading(true);
      let uid = await getUid();
      const response = await Backend.instance.contests(
        Wallet.addressList(),
        uid,
      );
      setRaffles([]);
      setRaffles(prepareRaffles(response));
    } catch (err) {
      Logger.captureException(
        err,
        'HomeEarnScreen.loadRaffles',
        Wallet.addressList(),
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
    EventTracker.instance.trackEvent(MarketingEvents.earnOpen);
  }, []);

  const onPressStaking = useCallback(() => {
    navigation.navigate(HomeEarnStackRoutes.Staking);
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
      navigation.navigate(HomeEarnStackRoutes.RaffleReward, {item: raffle});
    },
    [navigation],
  );
  const onPressRaffle = useCallback(
    (raffle: Raffle) => {
      if (raffle.status === 'closed') {
        navigation.navigate(HomeEarnStackRoutes.RaffleReward, {item: raffle});
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

      navigation.navigate(HomeEarnStackRoutes.RaffleDetails, {
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
});
