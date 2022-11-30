import React, {useCallback, useMemo} from 'react';

import {StakingUnDelegateForm} from '@app/components/staking-undelegate-form';
import {useTypedNavigation, useTypedRoute, useWallet} from '@app/hooks';
import {StakingMetadata} from '@app/models/staking-metadata';
import {Cosmos} from '@app/services/cosmos';

export const StakingUnDelegateFormScreen = () => {
  const navigation = useTypedNavigation();
  const {validator, account} = useTypedRoute<'stakingUnDelegateForm'>().params;

  const wallet = useWallet(account);

  const balance = useMemo(() => {
    const delegations = StakingMetadata.getDelegationsForValidator(
      validator.operator_address,
    );

    const delegation = delegations.find(
      d => d.delegator === wallet?.cosmosAddress,
    );

    return delegation?.amount ?? 0;
  }, [validator.operator_address, wallet?.cosmosAddress]);

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
