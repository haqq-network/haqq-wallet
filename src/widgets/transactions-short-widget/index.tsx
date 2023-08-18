/* eslint-disable react-hooks/exhaustive-deps */
import React, {memo, useCallback, useEffect, useState} from 'react';

import {Transaction} from '@app/models/transaction';
import {Wallet} from '@app/models/wallet';
import {TransactionsShortWidget} from '@app/widgets/transactions-short-widget/transactions-short-widget';

const TransactionsShortWidgetWrapper = memo(() => {
  const wallets = Wallet.addressList();
  const transactions = Transaction.getAll().snapshot();

  const [received, setReceived] = useState(0);
  const [spend, setSpend] = useState(0);

  const calculateInfo = useCallback(() => {
    wallets.map(wallet => {
      const receivedSum = transactions
        .filtered(`to = '${wallet.toLowerCase()}'`)
        .sum('value');

      const sendedSum = transactions
        .filtered(`from = '${wallet.toLowerCase()}'`)
        .sum('value');

      setReceived(prev => prev + receivedSum);
      setSpend(prev => prev + sendedSum);
    });
  }, []);

  useEffect(() => {
    calculateInfo();
  }, []);

  return (
    <TransactionsShortWidget
      received={received}
      spend={spend}
      onPress={() => {}}
    />
  );
});

export {TransactionsShortWidgetWrapper};
