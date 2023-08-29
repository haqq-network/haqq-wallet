import React, {memo, useCallback, useEffect, useMemo, useState} from 'react';

import {ProposalDepositForm} from '@app/components/proposal-deposit-form';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {
  ProposalDepositStackParamList,
  ProposalDepositStackRoutes,
} from '@app/screens/HomeStack/GovernanceStack/ProposalDepositStack';
import {EthNetwork} from '@app/services';
import {Balance} from '@app/services/balance';
import {Cosmos} from '@app/services/cosmos';

export const ProposalDepositFormScreen = memo(() => {
  const navigation = useTypedNavigation<ProposalDepositStackParamList>();
  const {account, proposal} = useTypedRoute<
    ProposalDepositStackParamList,
    ProposalDepositStackRoutes.ProposalDepositForm
  >().params;
  const fee = useMemo(() => new Balance(Cosmos.fee.amount), []);
  const [balance, setBalance] = useState(Balance.Empty);

  useEffect(() => {
    EthNetwork.getBalance(account).then(newBalance => {
      setBalance(newBalance);
    });
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
