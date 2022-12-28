import React, {useMemo} from 'react';

import {StyleSheet, View, ViewProps} from 'react-native';

import {Color} from '@app/colors';
import {useTheme} from '@app/hooks';
import {I18N} from '@app/i18n';

import {Text} from './text';

export enum LabelBlockVariant {
  default = 'default',
  error = 'error',
}

export type LabeledBlockProps = ViewProps & {
  label?: string;
  variant?: LabelBlockVariant;
  rightAction?: React.ReactNode;
  i18nLabel?: I18N;
};

export const LabeledBlock = ({
  children,
  style,
  i18nLabel,
  rightAction,
  variant = LabelBlockVariant.default,
  ...props
}: LabeledBlockProps) => {
  const {colors} = useTheme();
  const containerStyle = useMemo(
    () => [
      styles.container,
      {
        backgroundColor:
          variant === LabelBlockVariant.error ? colors.bg7 : colors.bg8,
      },
      style,
    ],
    [style, variant, colors],
  );

  const placeholderColor = useMemo(() => {
    return variant === LabelBlockVariant.error
      ? Color.textRed1
      : Color.textBase2;
  }, [variant]);

  return (
    <View style={containerStyle} {...props}>
      <View style={styles.flex}>
        {i18nLabel && <Text t14 i18n={i18nLabel} color={placeholderColor} />}
        <View style={styles.inner}>{children}</View>
      </View>
      {rightAction && <View style={styles.sub}>{rightAction}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 8,
    paddingBottom: 5,
    paddingHorizontal: 16,
    borderRadius: 16,
    flexDirection: 'row',
  },
  sub: {
    justifyContent: 'center',
    marginLeft: 12,
  },
  flex: {
    flex: 1,
  },
  inner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
