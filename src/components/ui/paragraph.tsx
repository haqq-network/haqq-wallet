import {StyleSheet, Text, TextProps} from 'react-native';
import * as React from 'react';
import {useMemo} from 'react';

export const Paragraph = ({style, children, ...props}: TextProps) => {
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
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 22,
    color: '#8E8E8E',
  },
});
