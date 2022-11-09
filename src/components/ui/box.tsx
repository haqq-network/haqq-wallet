import React, {useMemo} from 'react';
import {StyleSheet, View, ViewProps} from 'react-native';
import {LIGHT_BG_8} from '../../variables';

export const Box = ({children, style, ...props}: ViewProps) => {
  const container = useMemo(() => [page.container, style], [style]);
  return (
    <View style={container} {...props}>
      {children}
    </View>
  );
};

const page = StyleSheet.create({
  container: {
    width: 42,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: LIGHT_BG_8,
    borderRadius: 12,
  },
});
