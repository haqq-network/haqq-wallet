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
  subtitleI18nParams?: Record<string, string>;
  titleI18nParams?: Record<string, string>;
};
export const DataContent = ({
  title,
  subtitle,
  style,
  reversed,
  titleI18n,
  subtitleI18n,
  subtitleI18nParams,
  titleI18nParams,
}: DataContentProps) => {
  return (
    <View style={[styles.container, reversed && styles.reverse, style]}>
      <Text
        t11
        style={styles.title}
        color={Color.textBase1}
        ellipsizeMode="tail"
        i18n={titleI18n}
        i18params={titleI18nParams}
        numberOfLines={1}>
        {title}
      </Text>
      {(subtitleI18n || subtitle) && (
        <Text
          t14
          i18n={subtitleI18n}
          i18params={subtitleI18nParams}
          color={Color.textBase2}>
          {subtitle}
        </Text>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  title: {
    marginBottom: 2,
    alignItems: 'center',
    minHeight: 22,
    flexDirection: 'row',
  },
  reverse: {flexDirection: 'column-reverse'},
});
