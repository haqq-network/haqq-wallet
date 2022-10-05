import React from 'react';
import {StyleSheet, View} from 'react-native';
import {NoTransactionsIcon, Paragraph} from './ui';
import {GRAPHIC_SECOND_3, TEXT_SECOND_1} from '../variables';

export const TransactionEmpty = () => {
  return (
    <View style={page.container}>
      <NoTransactionsIcon color={GRAPHIC_SECOND_3} style={page.space} />
      <Paragraph h3 style={{color: TEXT_SECOND_1}}>
        No transactions
      </Paragraph>
    </View>
  );
};

const page = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 375,
  },
  space: {marginBottom: 12},
});
