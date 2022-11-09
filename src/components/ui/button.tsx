/* eslint-disable react-native/no-unused-styles */
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  ViewProps,
} from 'react-native';
import * as React from 'react';
import {useCallback, useMemo} from 'react';
import {
  LIGHT_BG_2,
  LIGHT_GRAPHIC_GREEN_1,
  LIGHT_GRAPHIC_SECOND_1,
  LIGHT_TEXT_BASE_3,
  LIGHT_TEXT_GREEN_1,
  LIGHT_TEXT_RED_1,
  LIGHT_TEXT_SECOND_1,
} from '../../variables';
import {Text} from './text';

export type ButtonProps = Omit<ViewProps, 'children'> & {
  title: string;
  disabled?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  onPress: () => void;
  iconRight?: React.ReactNode;
  iconLeft?: React.ReactNode;
  loading?: boolean;
};

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
  variant = ButtonVariant.text,
  size = ButtonSize.large,
  style,
  disabled,
  onPress,
  iconRight,
  iconLeft,
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
        <ActivityIndicator size="small" color={LIGHT_TEXT_BASE_3} />
      ) : (
        <Text
          t9={size !== ButtonSize.small}
          t12={size === ButtonSize.small}
          style={textStyle}>
          {title}
        </Text>
      )}
      {iconRight}
    </TouchableOpacity>
  );
};

const page = StyleSheet.create({
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
    backgroundColor: LIGHT_GRAPHIC_GREEN_1,
    borderRadius: 12,
    height: 54,
  },
  containedDisabledContainer: {
    backgroundColor: LIGHT_GRAPHIC_SECOND_1,
  },
  textContainer: {},
  errorContainer: {},
  outlinedContainer: {
    borderColor: LIGHT_GRAPHIC_GREEN_1,
    borderRadius: 12,
  },
  secondContainer: {
    backgroundColor: LIGHT_BG_2,
    borderRadius: 12,
  },
  secondDisabledContainer: {
    backgroundColor: LIGHT_GRAPHIC_SECOND_1,
  },
  textIconRight: {
    marginRight: 8,
  },
  textIconLeft: {
    marginLeft: 8,
  },
  containedText: {
    color: LIGHT_TEXT_BASE_3,
  },
  containedDisabledText: {
    color: LIGHT_TEXT_SECOND_1,
  },
  textText: {},
  outlinedText: {},
  errorText: {
    color: LIGHT_TEXT_RED_1,
  },
  secondText: {
    color: LIGHT_TEXT_GREEN_1,
  },
  secondDisabledText: {
    color: LIGHT_TEXT_SECOND_1,
  },
});
