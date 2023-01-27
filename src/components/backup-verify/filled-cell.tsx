import React from 'react';

import {Pressable} from 'react-native';

import {Color} from '@app/colors';
import {Text} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {WINDOW_WIDTH} from '@app/variables/common';

export type FilledCellProps = {
  word: string;
  onPress: () => void;
};

export const FilledCell = ({word, onPress}: FilledCellProps) => {
  return (
    <Pressable style={styles.cell} onPress={onPress}>
      <Text t14 center color={Color.textBase3}>
        {word}
      </Text>
    </Pressable>
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
    backgroundColor: Color.graphicGreen1,
  },
});
