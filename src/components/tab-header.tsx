import React from 'react';
import {StyleSheet} from 'react-native';
import {Paragraph} from './ui';
import {HeaderTitleProps} from '@react-navigation/elements';
import {TEXT_BASE_1} from '../variables';

// @ts-ignore
export const TabHeader = ({headerTitle}: HeaderTitleProps) => {
  return (
    <Paragraph p1 style={page.p1}>
      {headerTitle}
    </Paragraph>
  );
};

const page = StyleSheet.create({
  p1: {
    fontStyle: 'normal',
    fontWeight: '600',
    textAlign: 'center',
    color: TEXT_BASE_1,
  },
});
