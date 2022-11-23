import React, {useCallback} from 'react';

import {RouteProp, useRoute} from '@react-navigation/native';

import {StakingUnDelegateFinish} from '@app/components/staking-undelegate-finish';
import {useTypedNavigation} from '@app/hooks';

import {RootStackParamList} from '../types';

export const StakingUnDelegateFinishScreen = () => {
  const navigation = useTypedNavigation();
  const route =
    useRoute<RouteProp<RootStackParamList, 'stakingUnDelegateFinish'>>();

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
