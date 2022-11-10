import React, {useMemo} from 'react';

import {format, isSameYear, isToday} from 'date-fns';
import {StyleSheet, View} from 'react-native';

import {TransactionListDate} from '../../types';
import {LIGHT_TEXT_BASE_2} from '../../variables';
import {Text} from '../ui';

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
    <View style={page.container}>
      <Text t13 style={page.text}>
        {date}
      </Text>
    </View>
  );
};

const page = StyleSheet.create({
  container: {
    paddingTop: 16,
    paddingBottom: 8,
    paddingHorizontal: 24,
  },
  text: {
    fontWeight: '600',
    fontSize: 14,
    lineHeight: 18,
    color: LIGHT_TEXT_BASE_2,
  },
});
