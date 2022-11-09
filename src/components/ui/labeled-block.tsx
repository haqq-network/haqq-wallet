/* eslint-disable react-native/no-unused-styles */
import React, {useMemo} from 'react';
import {StyleSheet, View, ViewProps} from 'react-native';
import {
  LIGHT_BG_7,
  LIGHT_BG_8,
  LIGHT_TEXT_BASE_2,
  LIGHT_TEXT_RED_1,
} from '../../variables';
import {Text} from './text';

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

const page = StyleSheet.create({
  container: {
    backgroundColor: LIGHT_BG_8,
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
    color: LIGHT_TEXT_BASE_2,
    marginBottom: 2,
  },
  inner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  errorPlaceholder: {
    color: LIGHT_TEXT_RED_1,
  },
  errorContainer: {
    backgroundColor: LIGHT_BG_7,
  },
});
