import React from 'react';
import {StyleSheet, View, ViewStyle} from 'react-native';
import {Paragraph, ParagraphSize} from './paragraph';
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
    <View
      style={[
        page.container,
        reversed && {flexDirection: 'column-reverse'},
        style,
      ]}>
      <Paragraph style={page.title}>{title}</Paragraph>
      <Paragraph size={ParagraphSize.s} style={page.subtitle}>
        {subtitle}
      </Paragraph>
    </View>
  );
};
const page = StyleSheet.create({
  container: {},
  title: {
    color: TEXT_BASE_1,
    marginBottom: 2,
    alignItems: 'center',
    minHeight: 22,
    flexDirection: 'row',
  },
  subtitle: {},
});
