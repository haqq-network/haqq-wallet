import React from 'react';

import {View} from 'react-native';

import {NoTransactionsIcon, Text} from './ui';

import {Color, getColor} from '../colors';
import {createTheme} from '../helpers/create-theme';

export const TransactionEmpty = () => {
  return (
    <View style={page.container}>
      <NoTransactionsIcon
        color={getColor(Color.graphicSecond3)}
        style={page.space}
      />
      <Text t14 style={page.t14}>
        No transactions
      </Text>
    </View>
  );
};

const page = createTheme({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  space: {marginBottom: 12},
  t14: {color: Color.textSecond1},
});
