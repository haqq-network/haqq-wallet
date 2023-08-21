/* eslint-disable react-hooks/exhaustive-deps */
import React, {memo, useCallback, useEffect, useState} from 'react';

import {useTypedNavigation} from '@app/hooks';
import {Transaction} from '@app/models/transaction';
import {Wallet} from '@app/models/wallet';
import {TransactionsShortWidget} from '@app/widgets/transactions-short-widget/transactions-short-widget';

const TransactionsShortWidgetWrapper = memo(() => {
  const wallets = Wallet.addressList();
  const transactions = Transaction.getAll().snapshot();
  const navigation = useTypedNavigation();

  const [received, setReceived] = useState(0);
  const [spend, setSpend] = useState(0);

  const calculateInfo = useCallback(() => {
    wallets.map(wallet => {
      const receivedSum = transactions
        .filtered('to = $0', wallet.toLocaleLowerCase())
        .sum('value');

      const sendedSum = transactions
        .filtered('from = $0', wallet.toLocaleLowerCase())
        .sum('value');

      setReceived(prev => prev + receivedSum);
      setSpend(prev => prev + sendedSum);
    });
  }, []);

  const openTotalInfo = useCallback(() => {
    navigation.navigate('totalValueInfo');
  }, []);

  useEffect(() => {
    calculateInfo();
  }, []);

  return (
    <TransactionsShortWidget
      received={received}
      spend={spend}
      onPress={openTotalInfo}
    />
  );
});

export {TransactionsShortWidgetWrapper};
