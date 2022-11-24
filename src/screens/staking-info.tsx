import React, {useCallback} from 'react';

import {RouteProp, useRoute} from '@react-navigation/native';

import {StakingInfo} from '@app/components/staking-info';
import {useTypedNavigation} from '@app/hooks';
import {StakingMetadata} from '@app/models/staking-metadata';
import {RootStackParamList} from '@app/types';

export const StakingInfoScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'stakingInfo'>>();
  const navigation = useTypedNavigation();

  const onDelegate = useCallback(() => {
    navigation.push('stakingDelegate', {
      validator: route.params.validator.operator_address,
    });
  }, [navigation, route.params.validator.operator_address]);

  const onUnDelegate = useCallback(() => {
    navigation.push('stakingUnDelegate', {
      validator: route.params.validator.operator_address,
    });
  }, [navigation, route.params.validator.operator_address]);

  const delegated = StakingMetadata.getDelegationsForValidator(
    route.params.validator.operator_address,
  );

  console.log(delegated);

  return (
    <StakingInfo
      validator={route.params.validator}
      onDelegate={onDelegate}
      onUnDelegate={onUnDelegate}
      delegations={delegated}
    />
  );
};
