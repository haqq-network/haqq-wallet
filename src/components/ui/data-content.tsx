import React from 'react';
import {StyleSheet, View, ViewStyle} from 'react-native';
import {Paragraph, ParagraphSize} from './paragraph';
import {TEXT_BASE_1} from '../../variables';

export type DataContentProps = {
  title: string;
  subtitle?: string;
  style?: ViewStyle;
};
export const DataContent = ({title, subtitle, style}: DataContentProps) => {
  return (
    <View style={[page.container, style]}>
      <Paragraph style={page.title}>{title}</Paragraph>
      <Paragraph size={ParagraphSize.s} style={page.subtitle}>
        {subtitle}
      </Paragraph>
    </View>
  );
};
const page = StyleSheet.create({
  container: {},
  title: {color: TEXT_BASE_1, marginBottom: 2},
  subtitle: {},
});
