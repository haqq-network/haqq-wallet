import React, {useCallback} from 'react';

import {RaffleReward} from '@app/components/raffle-reward';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';

export const RaffleRewardScreen = () => {
  const navigation = useTypedNavigation();
  const params = useTypedRoute<'raffleReward'>()?.params;

  const onPressUnderstood = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <RaffleReward item={params.item} onPressUnderstood={onPressUnderstood} />
  );
};
