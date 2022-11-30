import React, {useCallback, useEffect, useState} from 'react';

import {RouteProp, useRoute} from '@react-navigation/native';

import {StakingUnDelegateForm} from '@app/components/staking-undelegate-form';
import {useTypedNavigation, useWallet} from '@app/hooks';
import {StakingMetadata} from '@app/models/staking-metadata';
import {Cosmos} from '@app/services/cosmos';
import {WEI} from '@app/variables';

import {RootStackParamList} from '../types';

export const StakingUnDelegateFormScreen = () => {
  const navigation = useTypedNavigation();
  const route =
    useRoute<RouteProp<RootStackParamList, 'stakingUnDelegateForm'>>();
  const wallet = useWallet(route.params.account);

  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const delegations = StakingMetadata.getDelegationsForValidator(
      route.params.validator.operator_address,
    );

    const delegation = delegations.find(
      d => d.delegator === wallet?.cosmosAddress,
    );

    if (delegation) {
      setBalance(delegation.amount / WEI);
    }
  }, [route.params.validator.operator_address, wallet?.cosmosAddress]);

  const fee = parseInt(Cosmos.fee.amount, 10);

  const onAmount = useCallback(
    (amount: number) => {
      navigation.navigate('stakingUnDelegatePreview', {
        validator: route.params.validator,
        account: route.params.account,
        amount,
        fee,
      });
    },
    [fee, navigation, route.params.account, route.params.validator],
  );

  return (
    <StakingUnDelegateForm balance={balance} onAmount={onAmount} fee={fee} />
  );
};
