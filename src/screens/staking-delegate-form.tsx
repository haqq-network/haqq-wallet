import React, {useCallback, useMemo} from 'react';

import {StakingDelegateForm} from '@app/components/staking-delegate-form';
import {useTypedNavigation, useTypedRoute, useWallet} from '@app/hooks';
import {useWalletsBalance} from '@app/hooks/use-wallets-balance';
import {Balance} from '@app/services/balance';
import {Cosmos} from '@app/services/cosmos';

export const StakingDelegateFormScreen = () => {
  const navigation = useTypedNavigation();
  const {account, validator} = useTypedRoute<'stakingDelegateForm'>().params;
  const wallet = useWallet(account);
  const balances = useWalletsBalance([wallet!]);
  const currentBalance = useMemo(() => balances[account], [balances, account]);
  const fee = useMemo(() => new Balance(Cosmos.fee.amount), []);

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
      balance={currentBalance.avaliableForStake}
      fee={fee}
    />
  );
};
