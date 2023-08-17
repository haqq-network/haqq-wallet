import React, {useMemo} from 'react';

import {useColor} from '@app/hooks/use-color';

import {BarChartItem} from './bar-chart-item';

import {Text} from '../text';

export interface BarChartTextProps {
  item: BarChartItem;
  data: BarChartItem[];
  index: number;
}

export function BarChartText({item, data, index}: BarChartTextProps) {
  const isFirst = useMemo(() => index === 0, [index]);
  const isLast = useMemo(() => index === data.length - 1, [data.length, index]);
  const color = useColor(item.color);

  if (item.percentage <= 0) {
    return null;
  }

  return (
    <Text key={item.id} t14 color={color}>
      {!isFirst && ' '}
      {item.title}
      {!isLast && ' '}
    </Text>
  );
}
