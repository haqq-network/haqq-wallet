import {StyleSheet, Text, TextProps} from 'react-native';
import * as React from 'react';
import {useMemo} from 'react';

export const H3 = ({style, children, ...props}: TextProps) => {
  const containerStyle = useMemo(() => [page.container, style], [style]);

  return (
    <Text style={containerStyle} {...props}>
      {children}
    </Text>
  );
};

const page = StyleSheet.create({
  container: {
    fontStyle: 'normal',
    fontWeight: '600',
    fontSize: 18,
    lineHeight: 24,
    textAlign: 'center',
    color: '#2F2F2F',
  },
});
