import React from 'react';

import {RouteProp, useRoute} from '@react-navigation/native';

import {StakingInfo} from '@app/components/staking-info';
import {RootStackParamList} from '@app/types';

export const StakingInfoScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'stakingInfo'>>();
  return <StakingInfo validator={route.params.validator} />;
};
