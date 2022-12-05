import React, {useMemo} from 'react';

import {View, ViewProps} from 'react-native';

import {Color, getColor} from '@app/colors';
import {createTheme} from '@app/helpers';
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
  label,
  i18nLabel,
  rightAction,
  variant = LabelBlockVariant.default,
  ...props
}: LabeledBlockProps) => {
  const containerStyle = useMemo(
    () => [
      page.container,
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
    <View style={containerStyle} {...props}>
      <View style={page.flex}>
        {label && (
          <Text i18n={i18nLabel} t14 color={placeholderColor}>
            {label}
          </Text>
        )}
        <View style={page.inner}>{children}</View>
      </View>
      {rightAction && <View style={page.sub}>{rightAction}</View>}
    </View>
  );
};

const page = createTheme({
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
