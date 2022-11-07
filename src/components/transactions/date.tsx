import React, {useMemo} from 'react';

import {format, isSameYear, isToday} from 'date-fns';
import {View} from 'react-native';

import {Color} from '../../colors';
import {createTheme} from '../../helpers/create-theme';
import {TransactionListDate} from '../../types';
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

const page = createTheme({
  container: {
    paddingTop: 16,
    paddingBottom: 8,
    paddingHorizontal: 24,
  },
  text: {
    fontWeight: '600',
    fontSize: 14,
    lineHeight: 18,
    color: Color.textBase2,
  },
});
