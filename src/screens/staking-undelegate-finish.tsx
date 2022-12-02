import React, {useCallback} from 'react';

import {StakingUnDelegateFinish} from '@app/components/staking-undelegate-finish';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';

export const StakingUnDelegateFinishScreen = () => {
  const navigation = useTypedNavigation();
  const {params} = useTypedRoute<'stakingUnDelegateFinish'>();

  const onDone = useCallback(() => {
    navigation.getParent()?.goBack();
  }, [navigation]);

  return (
    <StakingUnDelegateFinish
      onDone={onDone}
      validator={params.validator}
      amount={params.amount}
      fee={params.fee}
    />
  );
};
