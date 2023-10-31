import React from 'react';

import {View, ViewStyle} from 'react-native';

import {Color} from '@app/colors';
import {Text} from '@app/components/ui/text';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';

export type DataContentProps = {
  title?: React.ReactNode;
  subtitle?: string | React.ReactNode;
  style?: ViewStyle;
  reversed?: boolean;
  short?: boolean;
  numberOfLines?: number;
  titleI18n?: I18N;
  subtitleI18n?: I18N;
  subtitleI18nParams?: Record<string, string>;
  titleI18nParams?: Record<string, string>;
  onPress?: () => void;
  bold?: boolean;
};
export const DataContent = ({
  title,
  short,
  subtitle,
  style,
  reversed,
  onPress,
  titleI18n,
  subtitleI18n,
  subtitleI18nParams,
  titleI18nParams,
  numberOfLines = 1,
  bold = false,
}: DataContentProps) => {
  return (
    <View
      style={[
        !bold && styles.container,
        reversed && styles.reverse,
        short && styles.short,
        style,
      ]}>
      <View style={styles.titleContainer}>
        {/* @ts-expect-error */}
        <Text
          t11
          style={[styles.title, bold && styles.boldTitle]}
          color={Color.textBase1}
          ellipsizeMode="tail"
          i18n={titleI18n}
          i18params={titleI18nParams}
          numberOfLines={numberOfLines}
          onPress={onPress}>
          {title}
        </Text>
      </View>
      {(subtitleI18n || subtitle) && (
        <>
          {/* @ts-expect-error */}
          <Text
            t14
            i18n={subtitleI18n}
            i18params={subtitleI18nParams}
            color={Color.textBase2}>
            {subtitle}
          </Text>
        </>
      )}
    </View>
  );
};
const styles = createTheme({
  container: {
    paddingVertical: 16,
  },
  short: {
    paddingVertical: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    marginBottom: 2,
    alignItems: 'center',
    minHeight: 22,
    flexDirection: 'row',
  },
  reverse: {flexDirection: 'column-reverse'},
  boldTitle: {fontSize: 16, fontWeight: 'bold', marginBottom: 6},
});
