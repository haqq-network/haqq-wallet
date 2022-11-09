import React from 'react';
import {StyleSheet, View, ViewStyle} from 'react-native';
import {LIGHT_TEXT_BASE_1, LIGHT_TEXT_BASE_2} from '../../variables';
import {Text} from './text';

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
      <Text t11 style={page.title} ellipsizeMode="tail" numberOfLines={1}>
        {title}
      </Text>
      <Text t14 style={page.subtitle}>
        {subtitle}
      </Text>
    </View>
  );
};
const page = StyleSheet.create({
  title: {
    color: LIGHT_TEXT_BASE_1,
    marginBottom: 2,
    alignItems: 'center',
    minHeight: 22,
    flexDirection: 'row',
  },
  subtitle: {
    color: LIGHT_TEXT_BASE_2,
  },
  reverse: {flexDirection: 'column-reverse'},
});
