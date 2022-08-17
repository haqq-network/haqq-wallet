import {StyleSheet, Text, TextProps} from 'react-native';
import * as React from 'react';
import {useMemo} from 'react';
import {TEXT_BASE_1} from '../../variables';

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
    color: TEXT_BASE_1,
  },
});
