import React from 'react';
import {TransactionList, TransactionSource} from '../types';
import {TransactionDate} from './transactions/date';
import {TransactionSend} from './transactions/send';
import {TransactionReceive} from './transactions/receive';

export type TransactionPreviewProps = {
  item: TransactionList;
  onPress: (hash: string) => void;
};

export const TransactionRow = ({item, onPress}: TransactionPreviewProps) => {
  switch (item.source) {
    case TransactionSource.date:
      return <TransactionDate item={item} />;
    case TransactionSource.send:
      return <TransactionSend item={item} onPress={onPress} />;
    case TransactionSource.receive:
      return <TransactionReceive item={item} onPress={onPress} />;
    default:
      return null;
  }
};
