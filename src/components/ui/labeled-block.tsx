import React, {useMemo} from 'react';

import {TouchableOpacity, TouchableOpacityProps, View} from 'react-native';

import {I18N} from '@app/i18n';
import {Color, createTheme, getColor} from '@app/theme';

import {Text} from './text';

export enum LabelBlockVariant {
  default = 'default',
  error = 'error',
}

export type LabeledBlockProps = TouchableOpacityProps & {
  label?: string;
  variant?: LabelBlockVariant;
  rightAction?: React.ReactNode;
  leftAction?: React.ReactNode;
  i18nLabel?: I18N;
  onPress?: () => void;
};

export const LabeledBlock = ({
  children,
  style,
  label,
  i18nLabel,
  rightAction,
  leftAction,
  variant = LabelBlockVariant.default,
  onPress,
  ...props
}: LabeledBlockProps) => {
  const containerStyle = useMemo(
    () => [
      styles.container,
      {
        backgroundColor: getColor(
          variant === LabelBlockVariant.error ? Color.bg7 : Color.bg8,
        ),
      },
      style,
    ],
    [style, variant],
  );

  const placeholderColor = useMemo(() => {
    return variant === LabelBlockVariant.error
      ? Color.textRed1
      : Color.textBase2;
  }, [variant]);

  return (
    <TouchableOpacity
      disabled={!onPress}
      onPress={onPress}
      style={containerStyle}
      {...props}>
      {!!leftAction && <View style={styles.leftAction}>{leftAction}</View>}
      <View style={styles.flex}>
        {(label || i18nLabel) && (
          <>
            {/* @ts-expect-error */}
            <Text t14 i18n={i18nLabel} color={placeholderColor}>
              {label}
            </Text>
          </>
        )}
        <View style={styles.inner}>{children}</View>
      </View>
      {!!rightAction && <View style={styles.rightAction}>{rightAction}</View>}
    </TouchableOpacity>
  );
};

const styles = createTheme({
  container: {
    paddingTop: 8,
    paddingBottom: 5,
    paddingHorizontal: 16,
    borderRadius: 16,
    flexDirection: 'row',
  },
  rightAction: {
    justifyContent: 'center',
    marginLeft: 12,
  },
  leftAction: {
    justifyContent: 'center',
    marginRight: 12,
  },
  flex: {
    flex: 1,
  },
  inner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
