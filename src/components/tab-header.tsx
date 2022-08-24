import React from 'react';
import { StyleSheet } from 'react-native';
import { H3 } from './ui';
import { HeaderTitleProps } from '@react-navigation/elements';

// @ts-ignore
export const TabHeader = ({ headerTitle }: HeaderTitleProps) => {
  return <H3>{headerTitle}</H3>;
};

const page = StyleSheet.create({});
