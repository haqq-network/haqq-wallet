import React, {memo, useCallback} from 'react';

import {RaffleReward} from '@app/components/raffle-reward';
import {Events} from '@app/events';
import {awaitForEventDone} from '@app/helpers/await-for-event-done';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {
  HomeEarnStackParamList,
  HomeEarnStackRoutes,
} from '@app/screens/HomeStack/HomeEarnStack';

export const RaffleRewardScreen = memo(() => {
  const navigation = useTypedNavigation<HomeEarnStackParamList>();
  const params = useTypedRoute<
    HomeEarnStackParamList,
    HomeEarnStackRoutes.RaffleReward
  >()?.params;

  const onPressUnderstood = useCallback(async () => {
    await awaitForEventDone(Events.onAppReviewRequest);
    navigation.goBack();
  }, [navigation]);

  return (
    <RaffleReward item={params.item} onPressUnderstood={onPressUnderstood} />
  );
});
