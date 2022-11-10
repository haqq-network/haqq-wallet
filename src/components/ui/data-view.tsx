import React, {useMemo} from 'react';

import {StyleProp, StyleSheet, View, ViewStyle} from 'react-native';

import {Text} from './text';

import {LIGHT_TEXT_BASE_2} from '../../variables';

export type DataViewProps = {
  label: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export const DataView = ({label, children, style}: DataViewProps) => {
  const containerStyle = useMemo(() => [page.container, style], [style]);
  return (
    <View style={containerStyle}>
      <Text style={page.t11} t11>
        {label}
      </Text>
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
  t11: {
    color: LIGHT_TEXT_BASE_2,
  },
});
