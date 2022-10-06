import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Text, Waiting} from '../ui';
import {GRAPHIC_GREEN_2, TEXT_BASE_3} from '../../variables';

export type LoadingModalProps = {
  text?: string;
};
export const LoadingModal = ({text}: LoadingModalProps) => {
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
  text: {color: TEXT_BASE_3},
  waiting: {marginBottom: 40},
});
