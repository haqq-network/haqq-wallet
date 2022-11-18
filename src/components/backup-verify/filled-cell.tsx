import React from 'react';

import {Dimensions, View} from 'react-native';

import {Color} from '@app/colors';
import {Text} from '@app/components/ui';
import {createTheme} from '@app/helpers';

export type FilledCellProps = {
  word: string;
};

export const FilledCell = ({word}: FilledCellProps) => {
  return (
    <View style={styles.cell}>
      <Text t14 style={styles.cellText}>
        {word}
      </Text>
    </View>
  );
};

const styles = createTheme({
  cell: {
    justifyContent: 'center',
    alignItems: 'center',
    width: (Dimensions.get('window').width - 56) / 2,
    height: 30,
    paddingHorizontal: 20,
    paddingVertical: 3,
    borderRadius: 8,
    marginHorizontal: 8,
    marginVertical: 4,
    borderStyle: 'solid',
    borderColor: Color.bg3,
    borderWidth: 1,
    backgroundColor: Color.graphicGreen1,
  },
  cellText: {
    fontWeight: '600',
    color: Color.textBase3,
    textAlign: 'center',
  },
});
