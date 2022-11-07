import React, {useMemo} from 'react';

import {View, ViewProps} from 'react-native';

import {Text} from './text';

import {Color} from '../../colors';
import {createTheme} from '../../helpers/create-theme';

export enum LabelBlockVariant {
  default = 'default',
  error = 'error',
}

export type LabeledBlockProps = ViewProps & {
  label: string;
  variant?: LabelBlockVariant;
  rightAction?: React.ReactNode;
};

export const LabeledBlock = ({
  children,
  style,
  label,
  rightAction,
  variant = LabelBlockVariant.default,
  ...props
}: LabeledBlockProps) => {
  const containerStyle = useMemo(
    () => [page.container, page[`${variant}Container`], style],
    [style, variant],
  );

  const placeholderStyle = useMemo(
    () => [page.placeholder, page[`${variant}Placeholder`]],
    [variant],
  );

  return (
    <View style={containerStyle} {...props}>
      <View style={page.flex}>
        {label && (
          <Text clean style={placeholderStyle}>
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
    backgroundColor: Color.bg8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    flexDirection: 'row',
  },
  sub: {justifyContent: 'center', marginLeft: 12},
  flex: {flex: 1},
  placeholder: {
    fontSize: 14,
    lineHeight: 18,
    color: Color.textBase2,
    marginBottom: 2,
  },
  inner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  errorPlaceholder: {
    color: Color.textRed1,
  },
  errorContainer: {
    backgroundColor: Color.bg7,
  },
});
