import React, {useMemo} from 'react';

import {StyleProp, View, ViewStyle} from 'react-native';

import {Color, getColor} from '@app/colors';
import {Text} from '@app/components/ui/text';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';

export type BadgeProps = {
  text?: string;
  i18n?: I18N;
  labelColor: string | Color;
  textColor?: string | Color;
  style?: StyleProp<ViewStyle>;
};
export const Badge = ({
  text,
  i18n,
  labelColor,
  textColor = Color.textBase3,
  style,
}: BadgeProps) => {
  const container = useMemo(
    () => [styles.container, {backgroundColor: getColor(labelColor)}, style],
    [labelColor, style],
  );
  return (
    <View style={container}>
      <Text t13 color={textColor} i18n={i18n}>
        {text}
      </Text>
    </View>
  );
};

const styles = createTheme({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
});
