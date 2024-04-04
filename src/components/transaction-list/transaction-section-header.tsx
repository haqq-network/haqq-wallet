import React, {useMemo} from 'react';

import {format, isSameYear, isToday} from 'date-fns';
import {View} from 'react-native';

import {Color} from '@app/colors';
import {Text} from '@app/components/ui';
import {createTheme} from '@app/helpers';

import {SectionHeaderData} from './types';

export type TransactionDate = {
  data: SectionHeaderData;
};

export const TransactionSectionHeader = ({data}: TransactionDate) => {
  const date = useMemo(
    () => new Date(data?.section?.timestamp),
    [data.section.timestamp],
  );

  const dateStr = useMemo(() => {
    if (isToday(date)) {
      return 'Today';
    }

    const formatType = isSameYear(new Date(), date) ? 'd MMM' : 'd MMM Y';

    return format(date, formatType);
  }, [date]);

  return (
    <View style={styles.container}>
      <Text t13 color={Color.textBase2}>
        {dateStr}
      </Text>
    </View>
  );
};

const styles = createTheme({
  container: {
    paddingTop: 16,
    paddingBottom: 8,
    paddingHorizontal: 24,
    backgroundColor: Color.bg1,
  },
});
