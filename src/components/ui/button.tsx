import { StyleSheet, Text, TouchableOpacity, ViewProps } from 'react-native';
import * as React from 'react';
import { useCallback, useMemo } from 'react';
import {
  BG_2,
  GRAPHIC_GREEN_1,
  GRAPHIC_SECOND_1,
  TEXT_BASE_3,
  TEXT_GREEN_1,
  TEXT_RED_1,
  TEXT_SECOND_1,
} from '../../variables';

export type ButtonProps = Omit<ViewProps, 'children'> & {
  title: string;
  disabled?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  onPress: () => void;
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
  large = 'large',
}

export const Button = ({
  title,
  variant = ButtonVariant.text,
  size = ButtonSize.large,
  style,
  disabled,
  onPress,
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
      page.text,
      page[`${variant}Text`] ?? null,
      page[`${size}Text`] ?? null,
      disabled && `${variant}DisabledText` in page
        ? page[`${variant}DisabledText`]
        : null,
    ],
    [disabled, size, variant],
  );

  return (
    <TouchableOpacity style={containerStyle} onPress={onPressButton} {...props}>
      <Text style={textStyle}>{title}</Text>
    </TouchableOpacity>
  );
};

const page = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 28,
  },
  smallContainer: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  containedContainer: {
    backgroundColor: GRAPHIC_GREEN_1,
    borderRadius: 12,
  },
  containedDisabledContainer: {
    backgroundColor: GRAPHIC_SECOND_1,
  },
  textContainer: {},
  errorContainer: {},
  outlinedContainer: {
    borderColor: GRAPHIC_GREEN_1,
    borderRadius: 12,
  },
  secondContainer: {
    backgroundColor: BG_2,
    borderRadius: 12,
  },
  secondDisabledContainer: {
    backgroundColor: GRAPHIC_SECOND_1,
  },
  text: {
    fontWeight: '600',
    fontSize: 18,
    lineHeight: 24,
  },
  smallText: {
    fontWeight: '700',
    fontSize: 14,
    lineHeight: 18,
  },
  containedText: {
    color: TEXT_BASE_3,
  },
  containedDisabledText: {
    color: TEXT_SECOND_1,
  },
  textText: {},
  outlinedText: {},
  errorText: {
    color: TEXT_RED_1,
  },
  secondText: {
    color: TEXT_GREEN_1,
  },
  secondDisabledText: {
    color: TEXT_SECOND_1,
  },
});
