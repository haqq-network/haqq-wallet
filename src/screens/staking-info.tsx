import React, {useCallback} from 'react';

import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

import {StakingInfo} from '@app/components/staking-info';
import {RootStackParamList} from '@app/types';

export const StakingInfoScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'stakingInfo'>>();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const onStake = useCallback(() => {
    navigation.push('stakingDelegate', {
      validator: route.params.validator.operator_address,
    });
  }, [navigation, route.params.validator.operator_address]);

  return <StakingInfo validator={route.params.validator} onStake={onStake} />;
};
