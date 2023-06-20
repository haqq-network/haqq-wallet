import React, {useCallback, useState} from 'react';

import {useFocusEffect} from '@react-navigation/native';

import {RaffleDetails} from '@app/components/raffle-details';
import {onEarnGetTicket} from '@app/event-actions/on-earn-get-ticket';
import {captureException} from '@app/helpers';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';

export const RaffleDetailsScreen = () => {
  const navigation = useTypedNavigation();
  const params = useTypedRoute<'raffleDetails'>()?.params;

  const [raffle, setRaffle] = useState(params?.item);

  useFocusEffect(() => {
    navigation.setOptions({
      title: params?.item?.title,
    });
  });

  const onPressGetTicket = useCallback(async () => {
    try {
      const r = await onEarnGetTicket(params?.item?.id);
      setRaffle(r);
    } catch (e) {
      captureException(e, 'onPressGetTicket raffle details');
      throw e;
    }
  }, [params]);

  const onPressShowResult = useCallback(() => {
    navigation.navigate('raffleReward', params);
  }, [navigation, params]);

  if (!raffle) {
    return null;
  }

  return (
    <RaffleDetails
      item={raffle}
      prevIslmCount={params.prevIslmCount}
      prevTicketsCount={params.prevTicketsCount}
      onPressGetTicket={onPressGetTicket}
      onPressShowResult={onPressShowResult}
    />
  );
};
