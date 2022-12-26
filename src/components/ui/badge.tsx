import React, {useMemo} from 'react';

import {StyleProp, View, ViewStyle} from 'react-native';

import {Color, getColor} from '@app/colors';
import {Icon, IconsName, Spacer, Text} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
import {ColorType} from '@app/types';

export type BadgeValue =
  | {text: string; i18n?: undefined; i18params?: undefined}
  | {i18n: I18N; i18params?: Record<string, string>; text?: undefined};

export type BadgeProps = {
  iconLeftName?: IconsName;
  labelColor?: ColorType;
  textColor?: ColorType;
  style?: StyleProp<ViewStyle>;
  center?: boolean;
} & BadgeValue;
export const Badge = ({
  text,
  center,
  iconLeftName,
  i18n,
  i18params,
  labelColor,
  textColor = Color.textBase3,
  style,
}: BadgeProps) => {
  const container = useMemo(
    () => [
      styles.container,
      labelColor ? {backgroundColor: getColor(labelColor)} : styles.bordered,
      style,
    ],
    [labelColor, style],
  );

  return (
    <View style={[container, center && styles.center]}>
      {iconLeftName && (
        <>
          <Icon i20 name={iconLeftName} color={textColor} />
          <Spacer width={4} />
        </>
      )}
      {/* @ts-expect-error */}
      <Text t13 color={textColor} i18n={i18n} i18params={i18params}>
        {text}
      </Text>
    </View>
  );
};

const styles = createTheme({
  container: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  bordered: {
    borderWidth: 1,
    borderColor: Color.graphicSecond1,
  },
  center: {
    alignSelf: 'center',
  },
});
