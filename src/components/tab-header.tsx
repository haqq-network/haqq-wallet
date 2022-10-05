import React from 'react';
import {StyleSheet} from 'react-native';
import {Paragraph} from './ui';
import {HeaderTitleProps} from '@react-navigation/elements';
import {TEXT_BASE_1} from '../variables';

// @ts-ignore
export const TabHeader = ({headerTitle}: HeaderTitleProps) => {
  return (
    <Paragraph h1 style={page.h1}>
      {headerTitle}
    </Paragraph>
  );
};

const page = StyleSheet.create({
  h1: {
    fontStyle: 'normal',
    fontWeight: '600',
    textAlign: 'center',
    color: TEXT_BASE_1,
  },
});
