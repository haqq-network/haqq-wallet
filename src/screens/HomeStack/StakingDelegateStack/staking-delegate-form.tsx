import React, {memo, useCallback, useEffect, useState} from 'react';

import {StakingDelegateForm} from '@app/components/staking-delegate-form';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {
  StakingDelegateStackParamList,
  StakingDelegateStackRoutes,
} from '@app/screens/HomeStack/StakingDelegateStack';
import {EthNetwork} from '@app/services';
import {Cosmos} from '@app/services/cosmos';

export const StakingDelegateFormScreen = memo(() => {
  const navigation = useTypedNavigation<StakingDelegateStackParamList>();
  const {account, validator} = useTypedRoute<
    StakingDelegateStackParamList,
    StakingDelegateStackRoutes.StakingDelegateForm
  >().params;

  const [balance, setBalance] = useState(0);
  const fee = parseInt(Cosmos.fee.amount, 10);

  useEffect(() => {
    EthNetwork.getBalance(account).then(newBalance => {
      setBalance(newBalance);
    });
  }, [account]);

  const onAmount = useCallback(
    (amount: number) => {
      navigation.navigate(StakingDelegateStackRoutes.StakingDelegatePreview, {
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
});
