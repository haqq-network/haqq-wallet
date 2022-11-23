import React, {useCallback} from 'react';

import {RouteProp, useRoute} from '@react-navigation/native';

import {StakingUnDelegateForm} from '@app/components/staking-undelegate-form';
import {useTypedNavigation} from '@app/hooks';
import {Cosmos} from '@app/services/cosmos';

import {RootStackParamList} from '../types';

export const StakingUnDelegateFormScreen = () => {
  const navigation = useTypedNavigation();
  const route =
    useRoute<RouteProp<RootStackParamList, 'stakingUnDelegateForm'>>();

  const fee = parseInt(Cosmos.fee.amount, 10);

  const onAmount = useCallback(
    (amount: number) => {
      navigation.navigate('stakingUnDelegatePreview', {
        validator: route.params.validator,
        account: route.params.account,
        amount: amount,
        fee: fee,
      });
    },
    [fee, navigation, route.params.account, route.params.validator],
  );

  return (
    <StakingUnDelegateForm
      maxAmount={route.params.maxAmount}
      validator={route.params.validator}
      account={route.params.account}
      onAmount={onAmount}
      fee={fee}
    />
  );
};
