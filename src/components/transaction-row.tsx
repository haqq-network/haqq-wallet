import React, {useMemo} from 'react';

import {View} from 'react-native';

import {TransactionContract} from '@app/components/transactions/contract';
import {TransactionDate} from '@app/components/transactions/date';
import {TransactionReceive} from '@app/components/transactions/receive';
import {TransactionSend} from '@app/components/transactions/send';
import {
  OnTransactionRowPress,
  TransactionList,
  TransactionSource,
} from '@app/types';

export type TransactionPreviewProps = {
  item: TransactionList;
  onPress: OnTransactionRowPress;
};

export const TransactionRow = ({item, onPress}: TransactionPreviewProps) => {
  const element = useMemo(() => {
    switch (item.source) {
      case TransactionSource.date:
        return <TransactionDate item={item} />;
      case TransactionSource.send:
        return <TransactionSend item={item} onPress={onPress} />;
      case TransactionSource.receive:
        return <TransactionReceive item={item} onPress={onPress} />;
      case TransactionSource.contract:
        return <TransactionContract item={item} onPress={onPress} />;
      default:
        return null;
    }
  }, [item, onPress]);

  return <View key={`TransactionRow_${item.hash}`}>{element}</View>;
};
