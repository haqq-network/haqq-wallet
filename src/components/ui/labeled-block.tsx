import React, {useMemo} from 'react';
import {StyleSheet, Text, View, ViewProps} from 'react-native';
import {BG_8, TEXT_BASE_2} from '../../variables';

export type LabeledBlockProps = ViewProps & {
  label: string;
  rightAction?: React.ReactNode;
};

export const LabeledBlock = ({
  children,
  style,
  label,
  rightAction,
  ...props
}: LabeledBlockProps) => {
  const containerStyle = useMemo(() => [page.container, style], [style]);
  return (
    <View style={containerStyle} {...props}>
      <View style={{flex: 1}}>
        {label && <Text style={page.placeholder}>{label}</Text>}
        <View style={page.inner}>{children}</View>
      </View>
      {rightAction && (
        <View style={{justifyContent: 'center'}}>{rightAction}</View>
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
  placeholder: {
    fontSize: 14,
    lineHeight: 18,
    color: TEXT_BASE_2,
  },
  inner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
