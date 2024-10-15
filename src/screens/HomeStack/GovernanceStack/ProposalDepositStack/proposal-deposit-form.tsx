import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {observer} from 'mobx-react';

import {ProposalDepositForm} from '@app/components/proposal-deposit-form';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {Wallet} from '@app/models/wallet';
import {
  ProposalDepositStackParamList,
  ProposalDepositStackRoutes,
} from '@app/route-types';
import {Balance} from '@app/services/balance';
import {Cosmos} from '@app/services/cosmos';

export const ProposalDepositFormScreen = observer(() => {
  const navigation = useTypedNavigation<ProposalDepositStackParamList>();
  const {account, proposal} = useTypedRoute<
    ProposalDepositStackParamList,
    ProposalDepositStackRoutes.ProposalDepositForm
  >().params;
  const fee = useMemo(() => new Balance(Cosmos.fee.amount), []);
  const [balance, setBalance] = useState(Balance.Empty);

  useEffect(() => {
    const newBalance = Wallet.getBalance(account, 'available');
    setBalance(newBalance);
  }, [account]);

  const onAmount = useCallback(
    (amount: number) => {
      navigation.navigate(ProposalDepositStackRoutes.ProposalDepositPreview, {
        proposal,
        account,
        fee,
        amount,
      });
    },
    [fee, navigation, account, proposal],
  );

  return (
    <ProposalDepositForm
      account={account}
      onAmount={onAmount}
      balance={balance}
      fee={fee}
    />
  );
});
