import React, {useEffect} from 'react';

import {StatusBar, StyleSheet, View} from 'react-native';

import {BG_1, GRAPHIC_GREEN_2, TEXT_BASE_3} from '../../variables';
import {Text, Waiting} from '../ui';

export type LoadingModalProps = {
  text?: string;
};
export const LoadingModal = ({text}: LoadingModalProps) => {
  useEffect(() => {
    StatusBar.setBackgroundColor(GRAPHIC_GREEN_2);
    return () => StatusBar.setBackgroundColor(BG_1);
  }, []);
  return (
    <View style={page.container}>
      <Waiting style={page.waiting} />
      {text && (
        <Text t4 style={page.text}>
          {text}
        </Text>
      )}
    </View>
  );
};

const page = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    backgroundColor: GRAPHIC_GREEN_2,
  },
  text: {color: TEXT_BASE_3, width: 230, textAlign: 'center'},
  waiting: {marginBottom: 40},
});
