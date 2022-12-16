import React from 'react';

import {View} from 'react-native';

import {Color} from '@app/colors';
import {Text} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {WINDOW_WIDTH} from '@app/variables';

export type EmptyCellProps = {
  active: boolean;
  index: number;
};

export const EmptyCell = ({active, index}: EmptyCellProps) => {
  return (
    <View style={[styles.cell, active && styles.cellActive]}>
      <Text t14 center color={Color.textSecond1}>
        #{index}
      </Text>
    </View>
  );
};

const styles = createTheme({
  cell: {
    justifyContent: 'center',
    alignItems: 'center',
    width: (WINDOW_WIDTH - 56) / 2,
    height: 30,
    paddingHorizontal: 20,
    paddingVertical: 3,
    borderRadius: 8,
    marginHorizontal: 8,
    marginVertical: 4,
    borderStyle: 'solid',
    borderColor: Color.bg3,
    borderWidth: 1,
    backgroundColor: Color.bg3,
  },
  cellActive: {
    borderColor: Color.graphicGreen1,
  },
});
