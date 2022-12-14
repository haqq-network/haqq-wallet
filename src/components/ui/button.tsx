import * as React from 'react';
import {useCallback, useMemo} from 'react';

import {
  ActivityIndicator,
  StyleSheet,
  TextStyle,
  TouchableOpacity,
  ViewProps,
  ViewStyle,
} from 'react-native';

import {Color, getColor} from '@app/colors';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
import {ColorType} from '@app/types';

import {Icon, IconProps} from './icon';
import {Text} from './text';

export type ButtonValue =
  | {title: string; i18n?: undefined}
  | {i18n: I18N; title?: undefined};

export type ButtonRightIconProps =
  | {iconRight: IconProps['name']; iconRightColor: IconProps['color']}
  | {iconRight?: undefined; iconRightColor?: undefined};

export type ButtonLeftIconProps =
  | {iconLeft: IconProps['name']; iconLeftColor: IconProps['color']}
  | {iconLeft?: undefined; iconLeftColor?: undefined};

export type ButtonProps = Omit<ViewProps, 'children'> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  onPress: () => void;
  error?: boolean;
  loading?: boolean;
  disabled?: boolean;
  textColor?: ColorType;
  color?: ColorType;
  circleBorders?: boolean;
} & ButtonValue &
  ButtonRightIconProps &
  ButtonLeftIconProps;

export enum ButtonVariant {
  text = 'text',
  contained = 'contained',
  second = 'second',
  third = 'third',
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
  circleBorders,
  onPress,
  iconRight,
  iconRightColor,
  iconLeft,
  iconLeftColor,
  textColor,
  color,
  error,
  disabled,
  loading,
  ...props
}: ButtonProps) => {
  const onPressButton = useCallback(() => {
    if (!(disabled || loading)) {
      onPress();
    }
  }, [disabled, loading, onPress]);

  const containerStyle = useMemo(
    () =>
      StyleSheet.flatten([
        styles.container,
        variant === ButtonVariant.second && styles.secondContainer,
        variant === ButtonVariant.contained && styles.containedContainer,
        size === ButtonSize.small && styles.smallContainer,
        size === ButtonSize.middle && styles.middleContainer,
        size === ButtonSize.large && styles.largeContainer,
        circleBorders && styles.circleBorders,
        error &&
          variant === ButtonVariant.second &&
          styles.secondErrorContainer,
        disabled &&
          variant === ButtonVariant.second &&
          styles.secondDisabledContainer,
        disabled &&
          variant === ButtonVariant.contained &&
          styles.containedDisabledContainer,
        color && {backgroundColor: getColor(color)},
        style,
      ]),
    [variant, size, circleBorders, error, disabled, color, style],
  );

  const textStyle = useMemo(
    () =>
      StyleSheet.flatten<TextStyle>([
        iconLeft && styles.textIconLeft,
        iconRight && styles.textIconRight,
        variant === ButtonVariant.second && styles.secondText,
        variant === ButtonVariant.contained && styles.containedText,
        error && styles.errorText,
        disabled &&
          variant === ButtonVariant.second &&
          styles.secondDisabledText,
        disabled &&
          variant === ButtonVariant.contained &&
          styles.containedDisabledText,
      ]),
    [iconLeft, iconRight, variant, error, disabled],
  );

  return (
    <TouchableOpacity
      style={containerStyle as ViewStyle}
      onPress={onPressButton}
      activeOpacity={0.7}
      {...props}>
      {loading ? (
        <ActivityIndicator size="small" color={getColor(Color.textBase3)} />
      ) : (
        <>
          {iconLeft && (
            <Icon name={iconLeft} color={iconLeftColor} style={styles.icon} />
          )}
          {/* @ts-expect-error */}
          <Text
            t9={size !== ButtonSize.small}
            t12={size === ButtonSize.small}
            style={textStyle}
            color={textColor}
            i18n={i18n}>
            {title}
          </Text>
          {iconRight && (
            <Icon name={iconRight} color={iconRightColor} style={styles.icon} />
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = createTheme({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 13, // originally 16 but for android 16 - 3
    paddingHorizontal: 28,
  },
  circleBorders: {
    borderRadius: 100,
  },
  smallContainer: {
    paddingVertical: 3, // originally 6 but for android 6 - 3
    paddingHorizontal: 12,
    height: 34,
  },
  middleContainer: {
    paddingVertical: 9, // originally 12 but for android 12 - 3
    paddingHorizontal: 20,
    borderRadius: 12,
    height: 46,
  },
  largeContainer: {
    paddingVertical: 16, // originally 6 but for android 6 - 3
    paddingHorizontal: 12,
  },
  containedContainer: {
    backgroundColor: Color.graphicGreen1,
    borderRadius: 12,
    height: 54,
  },
  containedDisabledContainer: {
    backgroundColor: Color.graphicSecond1,
  },
  secondContainer: {
    backgroundColor: Color.bg2,
    borderRadius: 12,
  },
  secondDisabledContainer: {
    backgroundColor: Color.graphicSecond1,
  },
  secondErrorContainer: {
    backgroundColor: Color.bg7,
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
  errorText: {
    color: Color.textRed1,
  },
  secondText: {
    color: Color.textGreen1,
  },
  secondDisabledText: {
    color: Color.textSecond1,
  },
  icon: {
    width: 22,
    height: 22,
  },
});
