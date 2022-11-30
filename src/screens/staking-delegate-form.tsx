import React, {useCallback, useEffect, useState} from 'react';

import {RouteProp, useRoute} from '@react-navigation/native';

import {StakingDelegateForm} from '@app/components/staking-delegate-form';
import {useTypedNavigation} from '@app/hooks';
import {EthNetwork} from '@app/services';
import {Cosmos} from '@app/services/cosmos';

import {RootStackParamList} from '../types';

export const StakingDelegateFormScreen = () => {
  const navigation = useTypedNavigation();
  const route =
    useRoute<RouteProp<RootStackParamList, 'stakingDelegateForm'>>();

  const [balance, setBalance] = useState(0);
  const fee = parseInt(Cosmos.fee.amount, 10);

  useEffect(() => {
    EthNetwork.getBalance(route.params.account).then(newBalance => {
      setBalance(newBalance);
    });
  }, [route.params.account]);

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
      balance={balance}
      fee={fee}
    />
  );
};
