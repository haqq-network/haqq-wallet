import React, {useMemo} from 'react';
import {StyleSheet, Text, View, ViewProps} from 'react-native';
import {BG_8, TEXT_BASE_2} from '../../variables';

export type LabeledBlockProps = ViewProps & {
  label: string;
};

export const LabeledBlock = ({
  children,
  style,
  label,
  ...props
}: LabeledBlockProps) => {
  const containerStyle = useMemo(() => [page.container, style], [style]);
  return (
    <View style={containerStyle} {...props}>
      <Text style={page.placeholder}>{label}</Text>
      {children}
    </View>
  );
};

const page = StyleSheet.create({
  container: {
    backgroundColor: BG_8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  placeholder: {
    fontSize: 14,
    lineHeight: 18,
    color: TEXT_BASE_2,
  },
});
