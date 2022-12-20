import * as React from 'react';
import {useCallback, useMemo} from 'react';

import {ActivityIndicator, TouchableOpacity, ViewProps} from 'react-native';

import {Color, getColor} from '@app/colors';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';

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
  disabled?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  onPress: () => void;
  loading?: boolean;
  textColor?: Color | string;
  color?: Color | string;
  circleBorders?: boolean;
} & ButtonValue &
  ButtonRightIconProps &
  ButtonLeftIconProps;

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
  circleBorders,
  disabled,
  onPress,
  iconRight,
  iconRightColor,
  iconLeft,
  iconLeftColor,
  textColor,
  color,
  loading = false,
  ...props
}: ButtonProps) => {
  const onPressButton = useCallback(() => {
    if (!(disabled || loading)) {
      onPress();
    }
  }, [disabled, loading, onPress]);

  const containerStyle = useMemo(
    () => [
      styles.container,
      styles[`${variant}Container`] ?? null,
      styles[`${size}Container`] ?? null,
      circleBorders && styles.circleBorders,
      disabled && `${variant}DisabledContainer` in styles
        ? styles[`${variant}DisabledContainer`]
        : null,
      color && {backgroundColor: getColor(color)},
      style,
    ],
    [size, disabled, style, variant, color, circleBorders],
  );

  const textStyle = useMemo(
    () => [
      iconLeft && styles.textIconLeft,
      iconRight && styles.textIconRight,
      styles[`${variant}Text`] ?? null,
      disabled && `${variant}DisabledText` in styles
        ? styles[`${variant}DisabledText`]
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
        <>
          {iconLeft && (
            <Icon name={iconLeft} color={iconLeftColor} style={styles.icon} />
          )}
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
  // eslint-disable-next-line react-native/no-unused-styles
  smallContainer: {
    paddingVertical: 3, // originally 6 but for android 6 - 3
    paddingHorizontal: 12,
    height: 34,
  },
  // eslint-disable-next-line react-native/no-unused-styles
  middleContainer: {
    paddingVertical: 9, // originally 12 but for android 12 - 3
    paddingHorizontal: 20,
    borderRadius: 12,
    height: 46,
  },
  // eslint-disable-next-line react-native/no-unused-styles
  largeContainer: {
    paddingVertical: 16, // originally 6 but for android 6 - 3
    paddingHorizontal: 12,
  },
  // eslint-disable-next-line react-native/no-unused-styles
  containedContainer: {
    backgroundColor: Color.graphicGreen1,
    borderRadius: 12,
    height: 54,
  },
  // eslint-disable-next-line react-native/no-unused-styles
  containedDisabledContainer: {
    backgroundColor: Color.graphicSecond1,
  },
  // eslint-disable-next-line react-native/no-unused-styles
  outlinedContainer: {
    borderColor: Color.graphicGreen1,
    borderRadius: 12,
  },
  // eslint-disable-next-line react-native/no-unused-styles
  secondContainer: {
    backgroundColor: Color.bg2,
    borderRadius: 12,
  },
  // eslint-disable-next-line react-native/no-unused-styles
  secondDisabledContainer: {
    backgroundColor: Color.graphicSecond1,
  },
  // eslint-disable-next-line react-native/no-unused-styles
  errorContainer: {
    backgroundColor: Color.bg7,
  },
  textIconRight: {
    marginRight: 8,
  },
  textIconLeft: {
    marginLeft: 8,
  },
  // eslint-disable-next-line react-native/no-unused-styles
  containedText: {
    color: Color.textBase3,
  },
  // eslint-disable-next-line react-native/no-unused-styles
  containedDisabledText: {
    color: Color.textSecond1,
  },
  // eslint-disable-next-line react-native/no-unused-styles
  errorText: {
    color: Color.textRed1,
  },
  // eslint-disable-next-line react-native/no-unused-styles
  secondText: {
    color: Color.textGreen1,
  },
  // eslint-disable-next-line react-native/no-unused-styles
  secondDisabledText: {
    color: Color.textSecond1,
  },
  icon: {
    width: 22,
    height: 22,
  },
});
