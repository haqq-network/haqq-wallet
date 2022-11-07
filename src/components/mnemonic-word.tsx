import React from 'react';

import {View} from 'react-native';

import {Text} from './ui';

import {Color} from '../colors';
import {createTheme} from '../helpers/create-theme';

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

const page = createTheme({
  container: {
    margin: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  index: {
    marginRight: 8,
    color: Color.textBase2,
  },
  word: {
    fontWeight: '600',
    color: Color.graphicBase1,
  },
});
