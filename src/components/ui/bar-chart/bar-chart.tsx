import React from 'react';

import {StyleProp, View, ViewStyle} from 'react-native';

import {createTheme} from '@app/helpers';

import {BarChartItem} from './bar-chart-item';
import {BarChartText} from './bar-chart-text';

import {Spacer} from '../spacer';
import {Text} from '../text';

export interface BarChartProps {
  data: BarChartItem[];
  style?: StyleProp<ViewStyle>;
  hideText?: boolean;
}

export function BarChart({data, style, hideText = false}: BarChartProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.row}>
        {data.map((item, index) => {
          return (
            <BarChartItem
              key={`bar-chart-line-${item.id}`}
              item={item}
              index={index}
              data={data}
            />
          );
        })}
      </View>
      {!hideText && (
        <>
          <Spacer height={4} />
          <Text>
            {data.map((item, index) => {
              return (
                <BarChartText
                  key={`bar-chart-text-${item.id}`}
                  item={item}
                  index={index}
                  data={data}
                />
              );
            })}
          </Text>
        </>
      )}
    </View>
  );
}

const styles = createTheme({
  container: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    height: 6,
    width: '100%',
  },
});
