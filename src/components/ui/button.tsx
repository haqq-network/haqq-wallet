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
  BG_2,
  GRAPHIC_GREEN_1,
  GRAPHIC_SECOND_1,
  TEXT_BASE_3,
  TEXT_GREEN_1,
  TEXT_RED_1,
  TEXT_SECOND_1,
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
      page.text,
      iconLeft && page.textIconLeft,
      iconRight && page.textIconRight,
      page[`${variant}Text`] ?? null,
      page[`${size}Text`] ?? null,
      disabled && `${variant}DisabledText` in page
        ? page[`${variant}DisabledText`]
        : null,
    ],
    [disabled, iconLeft, iconRight, size, variant],
  );

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPressButton}
      activeOpacity={0.7}
      {...props}>
      {loading ? (
        <ActivityIndicator size="small" color={TEXT_BASE_3} />
      ) : (
        <Text t9 style={textStyle}>
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
    paddingVertical: 16,
    paddingHorizontal: 28,
  },
  smallContainer: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    height: 34,
  },
  middleContainer: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    height: 46,
  },
  containedContainer: {
    backgroundColor: GRAPHIC_GREEN_1,
    borderRadius: 12,
    height: 54,
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
    // height: 46,
  },
  secondDisabledContainer: {
    backgroundColor: GRAPHIC_SECOND_1,
  },
  text: {
    fontStyle: 'normal',
    fontSize: 18,
    lineHeight: 24,
  },
  textIconRight: {
    marginRight: 8,
  },
  textIconLeft: {
    marginLeft: 8,
  },
  smallText: {
    fontWeight: '700',
    fontSize: 14,
    lineHeight: 18,
  },
  middleText: {
    fontWeight: '700',
    fontSize: 16,
    lineHeight: 22,
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
    // height: 32,
    // top: 3,
  },
  secondDisabledText: {
    color: TEXT_SECOND_1,
  },
});
