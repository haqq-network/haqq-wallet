import React from 'react';
import {Transaction} from '../models/transaction';
import {Text, View} from 'react-native';

export type TransactionPreviewProps = {
  transaction: Transaction & Realm.Object;
};

export const TransactionPreview = ({transaction}: TransactionPreviewProps) => {
  return (
    <View style={{padding: 5}}>
      <Text>{transaction.from}</Text>
      <Text>{transaction.to}</Text>
      <Text>
        {(transaction.value + transaction.fee).toFixed(8)} (
        {transaction.confirmed ? 'confirmed' : 'wait for confirmation'})
      </Text>
    </View>
  );
};
