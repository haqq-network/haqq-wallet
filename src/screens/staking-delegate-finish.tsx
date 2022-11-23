import React, {useCallback} from 'react';

import {RouteProp, useRoute} from '@react-navigation/native';

import {StakingDelegateFinish} from '@app/components/staking-delegate-finish/staking-delegate-finish';
import {useTypedNavigation} from '@app/hooks';

import {RootStackParamList} from '../types';

export const StakingDelegateFinishScreen = () => {
  const navigation = useTypedNavigation();
  const route =
    useRoute<RouteProp<RootStackParamList, 'stakingDelegateFinish'>>();

  const onDone = useCallback(() => {
    navigation.getParent()?.goBack();
  }, [navigation]);

  return (
    <StakingDelegateFinish
      onDone={onDone}
      validator={route.params.validator}
      amount={route.params.amount}
      fee={route.params.fee}
    />
  );
};
