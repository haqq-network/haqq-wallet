import React from 'react';
import {TransactionList, TransactionSource} from '../types';
import {TransactionDate} from './transactions/date';
import {TransactionSend} from './transactions/send';
import {TransactionReceive} from './transactions/receive';

export type TransactionPreviewProps = {
  item: TransactionList;
};

export const TransactionPreview = ({item}: TransactionPreviewProps) => {
  console.log(item);

  switch (item.source) {
    case TransactionSource.date:
      return <TransactionDate item={item} />;
    case TransactionSource.send:
      return <TransactionSend item={item} />;
    case TransactionSource.receive:
      return <TransactionReceive item={item} />;
    default:
      return null;
  }
};
