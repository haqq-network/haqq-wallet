import React, {useEffect, useState} from 'react';

import {TransactionFinish} from '@app/components/transaction-finish';
import {useTransactions, useTypedNavigation, useTypedRoute} from '@app/hooks';
import {Transaction} from '@app/models/transaction';
import {HapticEffects, vibrate} from '@app/services/haptic';

export const TransactionFinishScreen = () => {
  const {navigate, getParent} = useTypedNavigation();
  const {hash} = useTypedRoute<'transactionFinish'>().params;

  const transactions = useTransactions();

  const [transaction, setTransaction] = useState<Transaction | null>(
    transactions.getTransaction(hash),
  );

  const onSubmit = () => {
    getParent()?.goBack();
  };

  useEffect(() => {
    setTransaction(transactions.getTransaction(hash));
    vibrate(HapticEffects.success);
  }, [hash, navigate, transactions]);

  useEffect(() => {
    const notificationsIsEnabled = false;
    if (!notificationsIsEnabled) {
      getParent()?.navigate('notificationPopup');
    }
  }, [getParent]);

  return <TransactionFinish onSubmit={onSubmit} transaction={transaction} />;
};
