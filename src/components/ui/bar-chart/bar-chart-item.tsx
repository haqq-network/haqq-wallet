import React, {useMemo} from 'react';

import {View} from 'react-native';

import {Color} from '@app/colors';
import {createTheme} from '@app/helpers';
import {useColor} from '@app/hooks/use-color';

export interface BarChartItem {
  id: string;
  title: string;
  // Value from 0 to 1
  // The sum of all percentages must be equal to 1
  percentage: number;
  color: Color;
}

export interface BarChartItemProps {
  item: BarChartItem;
  data: BarChartItem[];
  index: number;
}

export function BarChartItem({index, item, data}: BarChartItemProps) {
  const isFirst = useMemo(() => index === 0, [index]);
  const isLast = useMemo(() => index === data.length - 1, [data.length, index]);
  const color = useColor(item.color);
  const style = useMemo(
    () => ({flex: item.percentage, backgroundColor: color}),
    [color, item.percentage],
  );
  return (
    <View
      key={item.id}
      style={[
        style,
        styles.item,
        !isFirst && styles.leftInset,
        !isLast && styles.rightInset,
      ]}
    />
  );
}

const styles = createTheme({
  leftInset: {
    marginLeft: 2,
  },
  rightInset: {
    marginRight: 2,
  },
  item: {
    borderRadius: 4,
  },
});
