import React, {useMemo} from 'react';

import {StyleProp, View, ViewStyle} from 'react-native';

import {Color, getColor} from '@app/colors';
import {Icon, IconsName, Spacer, Text} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';

export type BadgeProps = {
  text?: string;
  iconLeftName?: IconsName;
  i18n?: I18N;
  labelColor?: string | Color;
  textColor?: string | Color;
  style?: StyleProp<ViewStyle>;
};
export const Badge = ({
  text,
  iconLeftName,
  i18n,
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
    <View style={container}>
      {iconLeftName && (
        <>
          <Icon i18 name={iconLeftName} color={textColor} />
          <Spacer width={4} />
        </>
      )}
      <Text t13 color={textColor} i18n={i18n}>
        {text}
      </Text>
    </View>
  );
};

const styles = createTheme({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  bordered: {
    borderWidth: 1,
    borderColor: Color.graphicSecond1,
  },
});
