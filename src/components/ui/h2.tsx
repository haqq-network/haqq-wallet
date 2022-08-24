import { StyleSheet, Text, TextProps } from 'react-native';
import * as React from 'react';
import { useMemo } from 'react';
import { TEXT_BASE_1 } from '../../variables';

export const H2 = ({ style, children, ...props }: TextProps) => {
  const containerStyle = useMemo(() => [page.container, style], [style]);

  return (
    <Text style={containerStyle} {...props}>
      {children}
    </Text>
  );
};

const page = StyleSheet.create({
  container: {
    fontWeight: '600',
    fontSize: 22,
    lineHeight: 30,
    textAlign: 'center',
    color: TEXT_BASE_1,
  },
});
