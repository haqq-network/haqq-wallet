import React, {useCallback} from 'react';

import {HomeEarn} from '@app/components/home-earn';
import {useTypedNavigation} from '@app/hooks';
import {I18N} from '@app/i18n';
import {sendNotification} from '@app/services';
import {Raffle, RaffleStatus} from '@app/types';

const RAFFLES: Raffle[] = [
  {
    id: '1',
    title: 'Raffle 1',
    description: 'Raffle 1 description',
    budget: '1000000',
    close_at: Date.now() + 86400000,
    start_at: Date.now(),
    locked_until: 0,
    status: RaffleStatus.open,
    total_tickets: 10,
    winner_tickets: 2,
    winners: 4,
  },
  {
    id: '2',
    title: 'Raffle 2',
    description: 'Raffle 2 description',
    budget: '1000000',
    close_at: Date.now() + 86400000,
    start_at: Date.now() - 86400000,
    locked_until: Date.now() + 86400000,
    status: RaffleStatus.open,
    total_tickets: 10,
    winner_tickets: 2,
    winners: 4,
  },
  {
    id: '3',
    title: 'Raffle 3',
    description: 'Raffle 3 description',
    budget: '100',
    close_at: Date.now() - 1000,
    start_at: Date.now(),
    locked_until: 0,
    status: RaffleStatus.open,
    total_tickets: 0,
    winner_tickets: 1,
    winners: 1,
  },
];

export const HomeEarnScreen = () => {
  const navigation = useTypedNavigation();

  const onPressStaking = useCallback(() => {
    navigation.navigate('staking');
  }, [navigation]);

  const onPressGetRewards = useCallback(() => {
    console.log('🟢 onPressGetRewards');
  }, []);
  const onPressGetTicket = useCallback((raffle: Raffle) => {
    sendNotification(I18N.earnTicketRecieved);
    console.log('🟢 onPressGetTicket', JSON.stringify(raffle, null, 2));
  }, []);
  const onPressShowResult = useCallback(
    (raffle: Raffle) => {
      console.log('🟢 onPressShowResult', JSON.stringify(raffle, null, 2));
      navigation.navigate('raffleReward', {item: raffle});
    },
    [navigation],
  );
  const onPressRaffle = useCallback(
    (raffle: Raffle) => {
      console.log('🟢 onPressRaffle', JSON.stringify(raffle, null, 2));
      navigation.navigate('raffleDetails', {item: raffle});
    },
    [navigation],
  );

  return (
    <HomeEarn
      rewardAmount={5000}
      showStakingRewards
      showStakingGetRewardsButtons
      onPressGetRewards={onPressGetRewards}
      onPressGetTicket={onPressGetTicket}
      onPressShowResult={onPressShowResult}
      onPressStaking={onPressStaking}
      onPressRaffle={onPressRaffle}
      raffleList={RAFFLES}
    />
  );
};
