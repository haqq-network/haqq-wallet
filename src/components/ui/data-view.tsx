import React, {useMemo} from 'react';
import {StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import {Text} from './text';

export type DataViewProps = {
  label: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export const DataView = ({label, children, style}: DataViewProps) => {
  const containerStyle = useMemo(() => [page.container, style], [style]);
  return (
    <View style={containerStyle}>
      <Text clean>{label}</Text>
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
