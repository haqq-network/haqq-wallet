import React, {useMemo} from 'react';
import {StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import {Paragraph} from './paragraph';

export type DataViewProps = {
  label: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export const DataView = ({label, children, style}: DataViewProps) => {
  const containerStyle = useMemo(() => [page.container, style], [style]);
  return (
    <View style={containerStyle}>
      <Paragraph>{label}</Paragraph>
      {children}
    </View>
  );
};

const page = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
});
