/* eslint-disable react-hooks/exhaustive-deps */
import React, {memo, useCallback, useEffect, useState} from 'react';

import {useTypedNavigation} from '@app/hooks';
import {useTransactionList} from '@app/hooks/use-transaction-list';
import {Wallet} from '@app/models/wallet';
import {
  TransactionListReceive,
  TransactionListSend,
  TransactionSource,
} from '@app/types';
import {TransactionsShortWidget} from '@app/widgets/transactions-short-widget/transactions-short-widget';

export const TransactionsShortWidgetWrapper = memo(() => {
  const adressList = Wallet.addressList();
  const transactions = useTransactionList(adressList);
  // We should filter transactions between our local wallets
  const filteredTransactions = transactions.filter(transaction => {
    const sourceWhiteList = [TransactionSource.send, TransactionSource.receive];
    const isInWhiteList = sourceWhiteList.includes(transaction.source);
    if (!isInWhiteList) {
      return false;
    }

    const item = transaction as TransactionListSend | TransactionListReceive;
    const isFromMyWallet = item.from && adressList.includes(item.from);
    const isToMyWallet = item.to && adressList.includes(item.to);
    return !(isFromMyWallet && isToMyWallet);
  }) as (TransactionListSend | TransactionListReceive)[];
  const navigation = useTypedNavigation();

  const [received, setReceived] = useState(0);
  const [spend, setSpend] = useState(0);

  const calculateInfo = () => {
    const info = filteredTransactions.reduce(
      (acc, current) => {
        if (adressList.includes(current.from?.toLowerCase())) {
          return {
            ...acc,
            send: acc.send + (current.value ?? 0) + (current.fee ?? 0),
          };
        } else {
          return {...acc, receive: acc.receive + (current.value ?? 0)};
        }
      },
      {send: 0, receive: 0},
    );

    setReceived(info.receive);
    setSpend(info.send);
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
