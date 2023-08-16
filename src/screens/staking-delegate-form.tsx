import React, {useCallback, useEffect, useState} from 'react';

import {StakingDelegateForm} from '@app/components/staking-delegate-form';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {EthNetwork} from '@app/services';
import {Balance} from '@app/services/balance';
import {Cosmos} from '@app/services/cosmos';

export const StakingDelegateFormScreen = () => {
  const navigation = useTypedNavigation();
  const {account, validator} = useTypedRoute<'stakingDelegateForm'>().params;

  const [balance, setBalance] = useState(Balance.Empty);
  const fee = parseInt(Cosmos.fee.amount, 10);

  useEffect(() => {
    EthNetwork.getBalance(account).then(newBalance => {
      setBalance(newBalance);
    });
  }, [account]);

  const onAmount = useCallback(
    (amount: number) => {
      navigation.navigate('stakingDelegatePreview', {
        validator,
        account,
        amount: amount,
        fee: fee,
      });
    },
    [fee, navigation, account, validator],
  );

  return (
    <StakingDelegateForm
      validator={validator}
      account={account}
      onAmount={onAmount}
      balance={balance}
      fee={fee}
    />
  );
};
