import React from 'react';
import {StyleSheet, View, ViewStyle} from 'react-native';
import {Paragraph} from './paragraph';
import {TEXT_BASE_1} from '../../variables';

export type DataContentProps = {
  title: React.ReactNode;
  subtitle?: string;
  style?: ViewStyle;
  reversed?: boolean;
};
export const DataContent = ({
  title,
  subtitle,
  style,
  reversed,
}: DataContentProps) => {
  return (
    <View style={[reversed && page.reverse, style]}>
      <Paragraph style={page.title}>{title}</Paragraph>
      <Paragraph h3>{subtitle}</Paragraph>
    </View>
  );
};
const page = StyleSheet.create({
  title: {
    color: TEXT_BASE_1,
    marginBottom: 2,
    alignItems: 'center',
    minHeight: 22,
    flexDirection: 'row',
  },
  reverse: {flexDirection: 'column-reverse'},
});
