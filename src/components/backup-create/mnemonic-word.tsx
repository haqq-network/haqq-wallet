import React from 'react';

import {StyleSheet, View} from 'react-native';

import {Color, getColor} from '@app/colors';

import {Text} from '../ui';

export type MnemonicWordProps = {
  word: string;
  index: number;
};

export const MnemonicWord = ({word, index}: MnemonicWordProps) => {
  return (
    <View style={page.container}>
      <Text t14 color={getColor(Color.textBase2)} style={page.index}>
        {index}
      </Text>
      <Text t10 color={getColor(Color.graphicBase1)}>
        {word}
      </Text>
    </View>
  );
};

const page = StyleSheet.create({
  container: {
    margin: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  index: {
    marginRight: 8,
  },
});
