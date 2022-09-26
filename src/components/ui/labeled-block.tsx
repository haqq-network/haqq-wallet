import React, {useMemo} from 'react';
import {StyleSheet, Text, View, ViewProps} from 'react-native';
import {BG_7, BG_8, TEXT_BASE_2, TEXT_RED_1} from '../../variables';

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
      <View style={{flex: 1}}>
        {label && <Text style={placeholderStyle}>{label}</Text>}
        <View style={page.inner}>{children}</View>
      </View>
      {rightAction && (
        <View style={{justifyContent: 'center', marginLeft: 12}}>
          {rightAction}
        </View>
      )}
    </View>
  );
};

const page = StyleSheet.create({
  container: {
    backgroundColor: BG_8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    flexDirection: 'row',
  },
  errorContainer: {
    backgroundColor: BG_7,
  },
  placeholder: {
    fontSize: 14,
    lineHeight: 18,
    color: TEXT_BASE_2,
    marginBottom: 2,
  },
  errorPlaceholder: {
    color: TEXT_RED_1,
  },
  inner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
