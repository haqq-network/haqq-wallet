import React, {memo, useCallback} from 'react';

import {StakingUnDelegateFinish} from '@app/components/staking-undelegate-finish';
import {app} from '@app/contexts';
import {Events} from '@app/events';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {
  StakingUnDelegateStackParamList,
  StakingUnDelegateStackRoutes,
} from '@app/screens/HomeStack/StakingUndelegateStack';

export const StakingUnDelegateFinishScreen = memo(() => {
  const navigation = useTypedNavigation<StakingUnDelegateStackParamList>();
  const {params} = useTypedRoute<
    StakingUnDelegateStackParamList,
    StakingUnDelegateStackRoutes.StakingUnDelegateFinish
  >();

  const onDone = useCallback(() => {
    app.emit(Events.onStakingSync);
    navigation.getParent()?.goBack();
  }, [navigation]);

  return (
    <StakingUnDelegateFinish
      onDone={onDone}
      validator={params.validator}
      amount={params.amount}
      fee={params.fee}
      txhash={params.txhash}
    />
  );
});
