import React, {useCallback} from 'react';

import {RaffleReward} from '@app/components/raffle-reward';
import {Events} from '@app/events';
import {awaitForEventDone} from '@app/helpers/await-for-event-done';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';

export const RaffleRewardScreen = () => {
  const navigation = useTypedNavigation();
  const params = useTypedRoute<'raffleReward'>()?.params;

  const onPressUnderstood = useCallback(async () => {
    await awaitForEventDone(Events.onAppReviewRequest);
    navigation.goBack();
  }, [navigation]);

  return (
    <RaffleReward item={params.item} onPressUnderstood={onPressUnderstood} />
  );
};
