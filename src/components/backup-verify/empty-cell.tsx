import React from 'react';

import {View} from 'react-native';

import {Text} from '@app/components/ui';
import {getWindowWidth} from '@app/helpers';
import {Color, createTheme} from '@app/theme';

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
    width: () => (getWindowWidth() - 56) / 2,
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
