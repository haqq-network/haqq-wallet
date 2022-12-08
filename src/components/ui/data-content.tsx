import React from 'react';

import {StyleSheet, View, ViewStyle} from 'react-native';

import {Color} from '@app/colors';
import {Text} from '@app/components/ui/text';
import {I18N} from '@app/i18n';

export type DataContentProps = {
  title?: React.ReactNode;
  subtitle?: string;
  style?: ViewStyle;
  reversed?: boolean;
  titleI18n?: I18N;
  subtitleI18n?: I18N;
};
export const DataContent = ({
  title,
  subtitle,
  style,
  reversed,
  titleI18n,
  subtitleI18n,
}: DataContentProps) => {
  return (
    <View style={[reversed && page.reverse, style]}>
      <Text
        t11
        style={page.title}
        color={Color.textBase1}
        ellipsizeMode="tail"
        i18n={titleI18n}
        numberOfLines={1}>
        {title}
      </Text>
      <Text t14 i18n={subtitleI18n} color={Color.textBase2}>
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
