import { StyleSheet, Text, View } from 'react-native';
import { TEXT_BASE_2 } from '../variables';
import React from 'react';

export type MnemonicWordProps = {
  word: string;
  index: number;
};

export const MnemonicWord = ({ word, index }: MnemonicWordProps) => {
  return (
    <View style={page.container}>
      <Text style={page.index}>{index}</Text>
      <Text style={page.word}>{word}</Text>
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
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 18,
  },
  word: {
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 22,
  },
});
