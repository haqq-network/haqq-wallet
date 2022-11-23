import * as React from 'react';
import {useCallback, useMemo} from 'react';

import {ActivityIndicator, TouchableOpacity, ViewProps} from 'react-native';

import {Color, getColor} from '@app/colors';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';

import {Text} from './text';

export type ButtonValue = {title: string} | {i18n: I18N};

export type ButtonProps = Omit<ViewProps, 'children'> & {
  title?: string;
  i18n?: I18N;
  disabled?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  onPress: () => void;
  iconRight?: React.ReactNode;
  iconLeft?: React.ReactNode;
  loading?: boolean;
  textColor?: string;
} & ButtonValue;

export enum ButtonVariant {
  text = 'text',
  error = 'error',
  contained = 'contained',
  outlined = 'outlined',
  second = 'second',
}

export enum ButtonSize {
  small = 'small',
  middle = 'middle',
  large = 'large',
}

export const Button = ({
  title,
  i18n,
  variant = ButtonVariant.text,
  size = ButtonSize.large,
  style,
  disabled,
  onPress,
  iconRight,
  iconLeft,
  textColor,
  loading = false,
  ...props
}: ButtonProps) => {
  const onPressButton = useCallback(() => {
    if (!disabled) {
      onPress();
    }
  }, [disabled, onPress]);

  const containerStyle = useMemo(
    () => [
      page.container,
      page[`${variant}Container`] ?? null,
      page[`${size}Container`] ?? null,
      disabled && `${variant}DisabledContainer` in page
        ? page[`${variant}DisabledContainer`]
        : null,
      style,
    ],
    [size, disabled, style, variant],
  );

  const textStyle = useMemo(
    () => [
      iconLeft && page.textIconLeft,
      iconRight && page.textIconRight,
      page[`${variant}Text`] ?? null,
      disabled && `${variant}DisabledText` in page
        ? page[`${variant}DisabledText`]
        : null,
    ],
    [disabled, iconLeft, iconRight, variant],
  );

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPressButton}
      activeOpacity={0.7}
      {...props}>
      {loading ? (
        <ActivityIndicator size="small" color={getColor(Color.textBase3)} />
      ) : (
        <Text
          t9={size !== ButtonSize.small}
          t12={size === ButtonSize.small}
          style={textStyle}
          color={textColor}
          i18n={i18n}>
          {title}
        </Text>
      )}
      {iconRight}
    </TouchableOpacity>
  );
};

const page = createTheme({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 13, // originally 16 but for android 16 - 3
    paddingHorizontal: 28,
  },
  smallContainer: {
    paddingVertical: 3, // originally 6 but for android 6 - 3
    paddingHorizontal: 12,
    height: 34,
  },
  middleContainer: {
    paddingVertical: 9, // originally 12 but for android 12 - 3
    paddingHorizontal: 20,
    height: 46,
  },
  containedContainer: {
    backgroundColor: Color.graphicGreen1,
    borderRadius: 12,
    height: 54,
  },
  containedDisabledContainer: {
    backgroundColor: Color.graphicSecond1,
  },
  textContainer: {},
  errorContainer: {},
  outlinedContainer: {
    borderColor: Color.graphicGreen1,
    borderRadius: 12,
  },
  secondContainer: {
    backgroundColor: Color.bg2,
    borderRadius: 12,
  },
  secondDisabledContainer: {
    backgroundColor: Color.graphicSecond1,
  },
  textIconRight: {
    marginRight: 8,
  },
  textIconLeft: {
    marginLeft: 8,
  },
  containedText: {
    color: Color.textBase3,
  },
  containedDisabledText: {
    color: Color.textSecond1,
  },
  textText: {},
  outlinedText: {},
  errorText: {
    color: Color.textRed1,
  },
  secondText: {
    color: Color.textGreen1,
  },
  secondDisabledText: {
    color: Color.textSecond1,
  },
});
