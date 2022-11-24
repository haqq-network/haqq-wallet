import React, {useCallback} from 'react';

import {StakingUnDelegateFinish} from '@app/components/staking-undelegate-finish';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';

export const StakingUnDelegateFinishScreen = () => {
  const navigation = useTypedNavigation();
  const route = useTypedRoute<'stakingUnDelegateFinish'>();

  const onDone = useCallback(() => {
    navigation.getParent()?.goBack();
  }, [navigation]);

  return (
    <StakingUnDelegateFinish
      onDone={onDone}
      validator={route.params.validator}
      amount={route.params.amount}
      fee={route.params.fee}
    />
  );
};
