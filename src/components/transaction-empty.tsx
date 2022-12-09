import React from 'react';

import {StyleSheet, View} from 'react-native';

import {Color, getColor} from '@app/colors';
import {NoTransactionsIcon, Text} from '@app/components/ui';
import {I18N} from '@app/i18n';

export const TransactionEmpty = () => {
  return (
    <View style={styles.container}>
      <NoTransactionsIcon
        color={getColor(Color.graphicSecond3)}
        style={styles.space}
      />
      <Text t14 i18n={I18N.TransactionEmpty} color={Color.textSecond1} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  space: {marginBottom: 12},
});
