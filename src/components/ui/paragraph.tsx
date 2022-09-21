import {StyleSheet, Text, TextProps} from 'react-native';
import * as React from 'react';
import {useMemo} from 'react';
import {TEXT_BASE_2} from '../../variables';

export enum ParagraphSize {
  xs = 'xs',
  s = 's',
  m = 'm',
  l = 'l',
  xl = 'xl',
}

export enum ParagraphFont {
  display = 'display',
  text = 'text',
}

export type ParagraphProps = TextProps & {
  size?: ParagraphSize;
  font?: ParagraphFont;
};

export const Paragraph = ({
  style,
  children,
  size = ParagraphSize.m,
  font = ParagraphFont.display,
  ...props
}: ParagraphProps) => {
  const containerStyle = useMemo(
    () => [page.container, style, page[size], page[`${font}Font`]],
    [font, size, style],
  );

  return (
    <Text style={containerStyle} {...props}>
      {children}
    </Text>
  );
};

const page = StyleSheet.create({
  container: {
    fontFamily: 'SF Pro Display',
    fontStyle: 'normal',
    fontWeight: '400',
    color: TEXT_BASE_2,
  },
  xs: {
    fontSize: 12,
    lineHeight: 16,
  },
  s: {
    fontSize: 14,
    lineHeight: 18,
  },
  m: {
    fontSize: 16,
    lineHeight: 22,
  },
  l: {
    fontSize: 18,
    lineHeight: 24,
  },
  xl: {
    fontSize: 22,
    lineHeight: 30,
  },
  displayFont: {
    fontFamily: 'SF Pro Display',
  },
  textFont: {
    fontFamily: 'SF Pro Text',
  },
});
