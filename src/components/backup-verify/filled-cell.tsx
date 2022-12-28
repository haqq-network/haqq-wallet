import React from 'react';

import {StyleSheet, View} from 'react-native';

import {Color} from '@app/colors';
import {Text} from '@app/components/ui';
import {useThematicStyles} from '@app/hooks';
import {WINDOW_WIDTH} from '@app/variables/common';

export type FilledCellProps = {
  word: string;
};

export const FilledCell = ({word}: FilledCellProps) => {
  const styles = useThematicStyles(stylesObj);
  return (
    <View style={styles.cell}>
      <Text t14 center color={Color.textBase3}>
        {word}
      </Text>
    </View>
  );
};

const stylesObj = StyleSheet.create({
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
