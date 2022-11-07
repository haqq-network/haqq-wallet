import React from 'react';

import {View, ViewStyle} from 'react-native';

import {Text} from './text';

import {Color} from '../../colors';
import {createTheme} from '../../helpers/create-theme';

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
const page = createTheme({
  title: {
    color: Color.textBase1,
    marginBottom: 2,
    alignItems: 'center',
    minHeight: 22,
    flexDirection: 'row',
  },
  subtitle: {
    color: Color.textBase2,
  },
  reverse: {flexDirection: 'column-reverse'},
});
