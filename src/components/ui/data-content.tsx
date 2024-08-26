import React from 'react';

import {TextProps, View, ViewStyle} from 'react-native';

import {Color} from '@app/colors';
import {Text, TextPosition, TextVariant} from '@app/components/ui/text';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';

export type DataContentProps = {
  title?: React.ReactNode;
  titleColor?: Color;
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
  subtitleProps?: TextProps;
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
  subtitleProps,
  titleColor = Color.textBase1,
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
        <Text
          variant={TextVariant.t11}
          style={[styles.title, bold && styles.boldTitle]}
          color={titleColor}
          ellipsizeMode="tail"
          i18n={titleI18n!}
          i18params={titleI18nParams}
          numberOfLines={numberOfLines}
          onPress={onPress}>
          {title}
        </Text>
      </View>
      <Text
        variant={TextVariant.t14}
        i18n={subtitleI18n!}
        i18params={subtitleI18nParams}
        color={Color.textBase2}
        position={TextPosition.left}
        {...(subtitleProps || {})}>
        {subtitle}
      </Text>
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
  boldTitle: {fontSize: 16, fontWeight: 'bold', marginBottom: 2},
});
