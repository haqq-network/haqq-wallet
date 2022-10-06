import React from 'react';
import {StyleSheet} from 'react-native';
import {Text} from './ui';
import {HeaderTitleProps} from '@react-navigation/elements';
import {TEXT_BASE_1} from '../variables';

// @ts-ignore
export const TabHeader = ({headerTitle}: HeaderTitleProps) => {
  return (
    <Text t8 style={page.t8}>
      {headerTitle}
    </Text>
  );
};

const page = StyleSheet.create({
  t8: {
    fontStyle: 'normal',
    fontWeight: '600',
    textAlign: 'center',
    color: TEXT_BASE_1,
  },
});
