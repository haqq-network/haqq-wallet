import React, {useCallback, useEffect, useState} from 'react';

import {ProposalDepositForm} from '@app/components/proposal-deposit-form';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {EthNetwork} from '@app/services';
import {Cosmos} from '@app/services/cosmos';

export const ProposalDepositFormScreen = () => {
  const navigation = useTypedNavigation();
  const {account, title, proposalId} =
    useTypedRoute<'proposalDepositForm'>().params;
  const fee = parseInt(Cosmos.fee.amount, 10);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    EthNetwork.getBalance(account).then(newBalance => {
      setBalance(newBalance);
    });
  }, [account]);

  const onAmount = useCallback(
    (amount: number) => {
      navigation.navigate('proposalDepositPreview', {
        title,
        account,
        fee,
        amount,
        proposalId,
      });
    },
    [fee, navigation, account, title, proposalId],
  );

  return (
    <ProposalDepositForm
      account={account}
      onAmount={onAmount}
      balance={balance}
      fee={fee}
    />
  );
};
