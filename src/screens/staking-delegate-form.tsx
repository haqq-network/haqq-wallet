import React, {useCallback} from 'react';

import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

import {StakingDelegateForm} from '@app/components/staking-delegate-form';

import {RootStackParamList} from '../types';

export const StakingDelegateFormScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route =
    useRoute<RouteProp<RootStackParamList, 'stakingDelegateForm'>>();

  const onAmount = useCallback(
    (amount: number) => {
      navigation.navigate('stakingDelegatePreview', {
        validator: route.params.validator,
        account: route.params.account,
        amount: amount,
        fee: 0,
      });
    },
    [navigation, route.params.account, route.params.validator],
  );

  return (
    <StakingDelegateForm
      validator={route.params.validator}
      account={route.params.account}
      onAmount={onAmount}
    />
  );
};
