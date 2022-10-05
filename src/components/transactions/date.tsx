import React, {useMemo} from 'react';
import {TransactionListDate} from '../../types';
import {StyleSheet, View} from 'react-native';
import {format, isSameYear, isToday} from 'date-fns';
import {TEXT_BASE_2} from '../../variables';
import {Paragraph} from '../ui';

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
      <Paragraph clean style={page.text}>
        {date}
      </Paragraph>
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
