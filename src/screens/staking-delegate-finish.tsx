import React, {useCallback} from 'react';

import {StakingDelegateFinish} from '@app/components/staking-delegate-finish/staking-delegate-finish';
import {app} from '@app/contexts';
import {Events} from '@app/events';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';

export const StakingDelegateFinishScreen = () => {
  const navigation = useTypedNavigation();
  const {params} = useTypedRoute<'stakingDelegateFinish'>();

  const onDone = useCallback(() => {
    app.emit(Events.onStakingSync);
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
};
