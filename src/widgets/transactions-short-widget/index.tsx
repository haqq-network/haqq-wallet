/* eslint-disable react-hooks/exhaustive-deps */
import React, {memo, useCallback, useEffect, useState} from 'react';

import {useTypedNavigation} from '@app/hooks';
import {useTransactionList} from '@app/hooks/use-transaction-list';
import {Wallet} from '@app/models/wallet';
import {TransactionSource} from '@app/types';
import {TransactionsShortWidget} from '@app/widgets/transactions-short-widget/transactions-short-widget';

export const TransactionsShortWidgetWrapper = memo(() => {
  const adressList = Wallet.addressList();
  const transactions = useTransactionList(adressList);
  const navigation = useTypedNavigation();

  const [received, setReceived] = useState(0);
  const [spend, setSpend] = useState(0);

  const calculateInfo = () => {
    const sendedSum = transactions
      .filter(transaction => {
        const isSend = transaction.source === TransactionSource.send;
        if (!isSend) {
          return false;
        }
        const isFromMyWallet =
          transaction.from && adressList.includes(transaction.from);
        const isToMyWallet =
          transaction.to && adressList.includes(transaction.to);
        return isSend && !(isFromMyWallet && isToMyWallet);
      })
      .reduce((acc, current) => {
        //@ts-ignore
        return acc + (current?.value ?? 0);
      }, 0);

    const receivedSum = transactions
      .filter(transaction => {
        const isRecieve = transaction.source === TransactionSource.receive;
        if (!isRecieve) {
          return false;
        }
        const isFromMyWallet =
          transaction.from && adressList.includes(transaction.from);
        const isToMyWallet =
          transaction.to && adressList.includes(transaction.to);

        return isRecieve && !(isFromMyWallet && isToMyWallet);
      })
      .reduce((acc, current) => {
        //@ts-ignore
        return acc + (current?.value ?? 0);
      }, 0);

    setReceived(receivedSum);
    setSpend(sendedSum);
  };

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
