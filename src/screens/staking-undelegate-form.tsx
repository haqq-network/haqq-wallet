import React, {useCallback, useEffect, useState} from 'react';

import {StakingUnDelegateForm} from '@app/components/staking-undelegate-form';
import {useTypedNavigation, useTypedRoute, useWallet} from '@app/hooks';
import {StakingMetadata} from '@app/models/staking-metadata';
import {Cosmos} from '@app/services/cosmos';
import {WEI} from '@app/variables';

export const StakingUnDelegateFormScreen = () => {
  const navigation = useTypedNavigation();
  const {validator, account} = useTypedRoute<'stakingUnDelegateForm'>().params;
  const {operator_address} = validator;

  const wallet = useWallet(account);

  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const delegations =
      StakingMetadata.getDelegationsForValidator(operator_address);

    const delegation = delegations.find(
      d => d.delegator === wallet?.cosmosAddress,
    );

    if (delegation) {
      setBalance(delegation.amount / WEI);
    }
  }, [operator_address, wallet?.cosmosAddress]);

  const fee = parseInt(Cosmos.fee.amount, 10);

  const onAmount = useCallback(
    (amount: number) => {
      navigation.navigate('stakingUnDelegatePreview', {
        validator: validator,
        account: account,
        amount,
        fee,
      });
    },
    [fee, navigation, account, validator],
  );

  return (
    <StakingUnDelegateForm balance={balance} onAmount={onAmount} fee={fee} />
  );
};
