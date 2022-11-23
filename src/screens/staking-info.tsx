import React, {useCallback} from 'react';

import {RouteProp, useRoute} from '@react-navigation/native';

import {StakingInfo} from '@app/components/staking-info';
import {useTypedNavigation} from '@app/hooks';
import {RootStackParamList} from '@app/types';

export const StakingInfoScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'stakingInfo'>>();
  const navigation = useTypedNavigation();

  const onStake = useCallback(() => {
    navigation.push('stakingDelegate', {
      validator: route.params.validator.operator_address,
    });
  }, [navigation, route.params.validator.operator_address]);

  return <StakingInfo validator={route.params.validator} onStake={onStake} />;
};
