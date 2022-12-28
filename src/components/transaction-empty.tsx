import React from 'react';

import {StyleSheet, View} from 'react-native';

import {Color} from '@app/colors';
import {NoTransactionsIcon, Text} from '@app/components/ui';
import {useTheme} from '@app/hooks';
import {I18N} from '@app/i18n';

export const TransactionEmpty = () => {
  const {colors} = useTheme();
  return (
    <View style={styles.container}>
      <NoTransactionsIcon color={colors.graphicSecond3} style={styles.space} />
      <Text t14 i18n={I18N.transactionsEmpty} color={Color.textSecond1} />
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
