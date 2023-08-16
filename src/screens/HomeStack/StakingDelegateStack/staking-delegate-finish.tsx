import React, {memo, useCallback} from 'react';

import {StakingDelegateFinish} from '@app/components/staking-delegate-finish/staking-delegate-finish';
import {app} from '@app/contexts';
import {Events} from '@app/events';
import {awaitForEventDone} from '@app/helpers/await-for-event-done';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {
  StakingDelegateStackParamList,
  StakingDelegateStackRoutes,
} from '@app/screens/HomeStack/StakingDelegateStack';

export const StakingDelegateFinishScreen = memo(() => {
  const navigation = useTypedNavigation<StakingDelegateStackParamList>();
  const {params} = useTypedRoute<
    StakingDelegateStackParamList,
    StakingDelegateStackRoutes.StakingDelegateFinish
  >();

  const onDone = useCallback(async () => {
    app.emit(Events.onStakingSync);
    await awaitForEventDone(Events.onAppReviewRequest);
    navigation.getParent()?.goBack();
  }, [navigation]);

  return (
    <StakingDelegateFinish
      onDone={onDone}
      validator={params.validator}
      amount={params.amount}
      fee={params.fee}
      txhash={params.txhash}
    />
  );
});
