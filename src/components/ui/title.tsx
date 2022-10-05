import {StyleSheet, TextProps} from 'react-native';
import * as React from 'react';
import {useMemo} from 'react';
import {TEXT_BASE_1} from '../../variables';
import {Paragraph} from './paragraph';

export const Title = ({style, children, ...props}: TextProps) => {
  const containerStyle = useMemo(() => [page.container, style], [style]);

  return (
    <Paragraph clean style={containerStyle} {...props}>
      {children}
    </Paragraph>
  );
};

const page = StyleSheet.create({
  container: {
    fontFamily: 'El Messiri',
    fontStyle: 'normal',
    fontWeight: '700',
    fontSize: 28,
    lineHeight: 38,
    textAlign: 'center',
    color: TEXT_BASE_1,
  },
});
