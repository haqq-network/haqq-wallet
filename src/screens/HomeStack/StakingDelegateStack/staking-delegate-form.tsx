import React, {memo, useCallback, useEffect, useMemo, useState} from 'react';

import {StakingDelegateForm} from '@app/components/staking-delegate-form';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {
  StakingDelegateStackParamList,
  StakingDelegateStackRoutes,
} from '@app/screens/HomeStack/StakingDelegateStack';
import {EthNetwork} from '@app/services';
import {Balance} from '@app/services/balance';
import {Cosmos} from '@app/services/cosmos';

export const StakingDelegateFormScreen = memo(() => {
  const navigation = useTypedNavigation<StakingDelegateStackParamList>();
  const {account, validator} = useTypedRoute<
    StakingDelegateStackParamList,
    StakingDelegateStackRoutes.StakingDelegateForm
  >().params;

  const [balance, setBalance] = useState(Balance.Empty);
  const fee = useMemo(() => new Balance(Cosmos.fee.amount), []);

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
