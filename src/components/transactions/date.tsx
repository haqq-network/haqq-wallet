import React from 'react';
import {TransactionListDate} from '../../types';
import {StyleSheet, Text, View} from 'react-native';
import {formatISO} from 'date-fns';
import {TEXT_BASE_2} from '../../variables';

export type TransactionDate = {
  item: TransactionListDate;
};

export const TransactionDate = ({item}: TransactionDate) => {
  return (
    <View style={page.container}>
      <Text style={page.text}>
        {formatISO(item.date, {representation: 'date'})}
      </Text>
    </View>
  );
};

const page = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  text: {
    fontWeight: '600',
    fontSize: 14,
    lineHeight: 18,
    color: TEXT_BASE_2,
  },
});
