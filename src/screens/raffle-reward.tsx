import React, {useCallback} from 'react';

import {RaffleReward} from '@app/components/raffle-reward';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {AppReview} from '@app/services/app-review';

export const RaffleRewardScreen = () => {
  const navigation = useTypedNavigation();
  const params = useTypedRoute<'raffleReward'>()?.params;

  const onPressUnderstood = useCallback(async () => {
    await AppReview.requestReview();
    navigation.goBack();
  }, [navigation]);

  return (
    <RaffleReward item={params.item} onPressUnderstood={onPressUnderstood} />
  );
};
