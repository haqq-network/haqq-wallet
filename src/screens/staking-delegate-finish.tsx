import React, {useCallback} from 'react';

import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

import {StakingDelegateFinish} from '@app/components/staking-delegate-finish/staking-delegate-finish';

import {RootStackParamList} from '../types';

export const StakingDelegateFinishScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
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
