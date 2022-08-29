import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Title, Waiting} from '../ui';
import {TEXT_BASE_3} from '../../variables';

export type LoadingModalProps = {
  text?: string;
};
export const LoadingModal = ({text}: LoadingModalProps) => {
  return (
    <View style={page.container}>
      <Waiting style={{marginBottom: 40}} />
      {text && <Title style={{color: TEXT_BASE_3}}>{text}</Title>}
    </View>
  );
};

const page = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    backgroundColor: '#04D484',
  },
  text: {color: TEXT_BASE_3},
});
