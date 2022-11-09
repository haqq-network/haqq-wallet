import React from 'react';

import {StyleSheet, View} from 'react-native';

import {NoTransactionsIcon, Text} from './ui';

import {LIGHT_GRAPHIC_SECOND_3, LIGHT_TEXT_SECOND_1} from '../variables';

export const TransactionEmpty = () => {
  return (
    <View style={page.container}>
      <NoTransactionsIcon color={LIGHT_GRAPHIC_SECOND_3} style={page.space} />
      <Text t14 style={{color: LIGHT_TEXT_SECOND_1}}>
        No transactions
      </Text>
    </View>
  );
};

const page = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  space: {marginBottom: 12},
});
