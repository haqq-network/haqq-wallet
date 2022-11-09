import {StyleSheet, View} from 'react-native';
import React from 'react';
import {LIGHT_GRAPHIC_BASE_1, LIGHT_TEXT_BASE_2} from '../variables';
import {Text} from './ui';

export type MnemonicWordProps = {
  word: string;
  index: number;
};

export const MnemonicWord = ({word, index}: MnemonicWordProps) => {
  return (
    <View style={page.container}>
      <Text t14 style={page.index}>
        {index}
      </Text>
      <Text t10 style={page.word}>
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
    color: LIGHT_TEXT_BASE_2,
  },
  word: {
    fontWeight: '600',
    color: LIGHT_GRAPHIC_BASE_1,
  },
});
