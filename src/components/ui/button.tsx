import {StyleSheet, Text, TouchableOpacity, ViewProps} from 'react-native';
import * as React from 'react';
import {useCallback, useMemo} from 'react';
import {
  GRAPHIC_GREEN_1,
  GRAPHIC_SECOND_1,
  TEXT_BASE_3,
  TEXT_RED_1,
  TEXT_SECOND_1,
} from '../../variables';

export type ButtonProps = Omit<ViewProps, 'children'> & {
  title: string;
  disabled?: boolean;
  variant?: ButtonVariant;
  onPress: () => void;
};

export enum ButtonVariant {
  text = 'text',
  error = 'error',
  contained = 'contained',
  outlined = 'outlined',
}

export const Button = ({
  title,
  variant = ButtonVariant.text,
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
      disabled && `${variant}DisabledContainer` in page
        ? page[`${variant}DisabledContainer`]
        : null,
      style,
    ],
    [disabled, style, variant],
  );

  const textStyle = useMemo(
    () => [
      page.text,
      page[`${variant}Text`] ?? null,
      disabled && `${variant}DisabledText` in page
        ? page[`${variant}DisabledText`]
        : null,
    ],
    [disabled, variant],
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
    paddingTop: 16,
    paddingBottom: 16,
    paddingLeft: 28,
    paddingRight: 28,
  },
  containedContainer: {
    backgroundColor: GRAPHIC_GREEN_1,
    borderRadius: 16,
  },
  containedDisabledContainer: {
    backgroundColor: GRAPHIC_SECOND_1,
  },
  textContainer: {},
  errorContainer: {},
  outlinedContainer: {
    borderColor: GRAPHIC_GREEN_1,
    borderRadius: 16,
  },
  text: {
    fontWeight: '600',
    fontSize: 18,
    lineHeight: 24,
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
});
