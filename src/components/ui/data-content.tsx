import React from 'react';

import {StyleSheet, View, ViewStyle} from 'react-native';

import {Color} from '@app/colors';
import {I18N} from '@app/i18n';

import {Text} from './text';

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
    <View style={[styles.container, reversed && styles.reverse, style]}>
      <Text
        t11
        style={styles.title}
        color={Color.textBase1}
        ellipsizeMode="tail"
        i18n={titleI18n}
        numberOfLines={1}>
        {title}
      </Text>
      {(subtitleI18n || subtitle) && (
        <Text t14 i18n={subtitleI18n} color={Color.textBase2}>
          {subtitle}
        </Text>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    minHeight: 54,
    justifyContent: 'center',
  },
  title: {
    marginBottom: 2,
    alignItems: 'center',
    minHeight: 22,
    flexDirection: 'row',
  },
  reverse: {flexDirection: 'column-reverse'},
});
