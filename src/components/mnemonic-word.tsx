import {StyleSheet, View} from 'react-native';
import {GRAPHIC_BASE_1, TEXT_BASE_2} from '../variables';
import React from 'react';
import {Paragraph, ParagraphSize} from './ui';

export type MnemonicWordProps = {
  word: string;
  index: number;
};

export const MnemonicWord = ({word, index}: MnemonicWordProps) => {
  return (
    <View style={page.container}>
      <Paragraph size={ParagraphSize.s} style={page.index}>
        {index}
      </Paragraph>
      <Paragraph style={page.word}>{word}</Paragraph>
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
    color: TEXT_BASE_2,
  },
  word: {
    fontWeight: '600',
    color: GRAPHIC_BASE_1,
  },
});
