import React, {useCallback} from 'react';

import {StakingUnDelegateFinish} from '@app/components/staking-undelegate-finish';
import {app} from '@app/contexts';
import {Events} from '@app/events';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';

export const StakingUnDelegateFinishScreen = () => {
  const navigation = useTypedNavigation();
  const {params} = useTypedRoute<'stakingUnDelegateFinish'>();

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
    />
  );
};
