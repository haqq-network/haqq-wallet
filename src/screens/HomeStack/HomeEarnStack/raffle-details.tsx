import React, {memo, useCallback} from 'react';

import {useFocusEffect} from '@react-navigation/native';

import {RaffleDetails} from '@app/components/raffle-details';
import {onEarnGetTicket} from '@app/event-actions/on-earn-get-ticket';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {
  HomeEarnStackParamList,
  HomeEarnStackRoutes,
} from '@app/screens/HomeStack/HomeEarnStack';

export const RaffleDetailsScreen = memo(() => {
  const navigation = useTypedNavigation<HomeEarnStackParamList>();
  const params = useTypedRoute<
    HomeEarnStackParamList,
    HomeEarnStackRoutes.RaffleDetails
  >()?.params;

  useFocusEffect(() => {
    navigation.setOptions({
      title: params?.item?.title,
    });
  });

  const onPressGetTicket = useCallback(async () => {
    try {
      await onEarnGetTicket(params?.item?.id);
    } catch (e) {
      Logger.captureException(e, 'onPressGetTicket raffle details');
      throw e;
    }
  }, [params]);

  const onPressShowResult = useCallback(() => {
    navigation.navigate(HomeEarnStackRoutes.RaffleReward, params);
  }, [navigation, params]);

  if (!params?.item) {
    return null;
  }

  return (
    <RaffleDetails
      item={params.item}
      prevIslmCount={params.prevIslmCount}
      prevTicketsCount={params.prevTicketsCount}
      onPressGetTicket={onPressGetTicket}
      onPressShowResult={onPressShowResult}
    />
  );
});
