import React from 'react';

import {StyleSheet, View, ViewStyle} from 'react-native';

import {Color} from '@app/colors';

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
      <Text
        t11
        style={page.title}
        color={Color.textBase1}
        ellipsizeMode="tail"
        numberOfLines={1}>
        {title}
      </Text>
      <Text t14 color={Color.textBase2}>
        {subtitle}
      </Text>
    </View>
  );
};
const page = StyleSheet.create({
  title: {
    marginBottom: 2,
    alignItems: 'center',
    minHeight: 22,
    flexDirection: 'row',
  },
  reverse: {flexDirection: 'column-reverse'},
});
