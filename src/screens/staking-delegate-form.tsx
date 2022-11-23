import React, {useCallback} from 'react';

import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

import {StakingDelegateForm} from '@app/components/staking-delegate-form';
import {Cosmos} from '@app/services/cosmos';

import {RootStackParamList} from '../types';

export const StakingDelegateFormScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route =
    useRoute<RouteProp<RootStackParamList, 'stakingDelegateForm'>>();

  const fee = parseInt(Cosmos.fee.amount, 10);

  const onAmount = useCallback(
    (amount: number) => {
      navigation.navigate('stakingDelegatePreview', {
        validator: route.params.validator,
        account: route.params.account,
        amount: amount,
        fee: fee,
      });
    },
    [fee, navigation, route.params.account, route.params.validator],
  );

  return (
    <StakingDelegateForm
      validator={route.params.validator}
      account={route.params.account}
      onAmount={onAmount}
      fee={fee}
    />
  );
};
