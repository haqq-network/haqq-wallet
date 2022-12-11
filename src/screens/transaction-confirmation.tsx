import React from 'react';

import {ethers} from 'ethers';

import {TransactionConfirmation} from '@app/components/transaction-confirmation';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';

export const TransactionConfirmationScreen = () => {
  const navigation = useTypedNavigation();
  const {from, to, amount} = useTypedRoute<'transactionConfirmation'>().params;
  const onDoneLedgerBt = (estimateFee: number) =>
    navigation.navigate('transactionLedger', {
      from: from,
      to: to,
      amount: amount,
      fee: estimateFee,
    });
  const onDoneTransaction = (
    transaction: ethers.providers.TransactionResponse,
  ) =>
    navigation.navigate('transactionFinish', {
      hash: transaction.hash,
    });

  return (
    <TransactionConfirmation
      onDoneLedgerBt={onDoneLedgerBt}
      onDoneTransaction={onDoneTransaction}
    />
  );
};
