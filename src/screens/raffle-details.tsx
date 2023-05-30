import React, {useCallback} from 'react';

import {useFocusEffect} from '@react-navigation/native';

import {RaffleDetails} from '@app/components/raffle-details';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {I18N} from '@app/i18n';
import {sendNotification} from '@app/services';

export const RaffleDetailsScreen = () => {
  const navigation = useTypedNavigation();
  const params = useTypedRoute<'raffleDetails'>()?.params;

  useFocusEffect(() => {
    navigation.setOptions({
      title: params?.item?.title,
    });
  });

  const onPressGetTicket = useCallback(() => {
    sendNotification(I18N.earnTicketRecieved);
    console.log('🟢 onPressGetTicket', JSON.stringify(params, null, 2));
  }, [params]);

  const onPressShowResult = useCallback(() => {
    console.log('🟢 onPressShowResult', JSON.stringify(params, null, 2));
    navigation.navigate('raffleReward', params);
  }, [navigation, params]);

  if (!params.item) {
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
};
