import React from 'react';

import {StyleSheet, View} from 'react-native';

import {Color} from '@app/colors';
import {Text} from '@app/components/ui';

export type MnemonicWordProps = {
  word: string;
  index: number;
  testID?: string;
};

export const MnemonicWord = ({word, index, testID}: MnemonicWordProps) => {
  return (
    <View style={page.container}>
      <Text t14 color={Color.textBase2} style={page.index}>
        {index}
      </Text>
      <Text t10 color={Color.graphicBase1} testID={`${testID}_${index}`}>
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
