import React, {memo} from 'react';

import {StyleProp, TouchableOpacity, ViewStyle} from 'react-native';

import {Color, getColor} from '@app/colors';
import {Text} from '@app/components/ui/text';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';

const TagColors = {
  active: {bg: Color.graphicGreen1, text: Color.textBase3},
  inactive: {bg: Color.bg8, text: Color.textBase1},
};

export type TagProps = {
  tagVariant?: keyof typeof TagColors;
  text?: string;
  i18n?: I18N;
  style?: StyleProp<ViewStyle>;
  marginHorizontal?: number;
  onPress?: () => void;
};

export const Tag = memo(
  ({
    text,
    i18n,
    tagVariant = 'inactive',
    style,
    marginHorizontal = 4,
    onPress,
  }: TagProps) => {
    const variant = TagColors[tagVariant];

    const container = [
      styles.container,
      {
        backgroundColor: getColor(variant.bg),
        marginHorizontal,
      },
      style,
    ];

    return (
      <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={container}>
        {/* @ts-expect-error */}
        <Text t13 color={variant.text} i18n={i18n}>
          {text}
        </Text>
      </TouchableOpacity>
    );
  },
);

const styles = createTheme({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 100,
  },
});
