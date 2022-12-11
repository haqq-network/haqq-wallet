import React, {useMemo} from 'react';

import {format, isSameYear, isToday} from 'date-fns';
import {StyleSheet, View} from 'react-native';

import {Color} from '@app/colors';
import {Text} from '@app/components/ui';
import {TransactionListDate} from '@app/types';

export type TransactionDate = {
  item: TransactionListDate;
};

export const TransactionDate = ({item}: TransactionDate) => {
  const date = useMemo(() => {
    if (isToday(item.date)) {
      return 'Today';
    }

    const formatType = isSameYear(new Date(), item.date) ? 'd MMM' : 'd MMM Y';

    return format(item.date, formatType);
  }, [item.date]);

  return (
    <View style={styles.container}>
      <Text t13 color={Color.textBase2}>
        {date}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
    paddingBottom: 8,
    paddingHorizontal: 24,
  },
});
