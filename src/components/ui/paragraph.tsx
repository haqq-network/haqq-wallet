import {StyleSheet, Text, TextProps, StyleProp, TextStyle} from 'react-native';
import * as React from 'react';
import {useMemo} from 'react';
import {TEXT_BASE_2} from '../../variables';

export enum ParagraphSize {
  xl = 'xl', //h0
  l = 'l', //h1
  m = 'm', //h2
  s = 's', //h3
  xs = 'xs', //h4
}

interface TxtT {
  h0?: boolean;
  h1?: boolean;
  h2?: boolean;
  h3?: boolean;
  h4?: boolean;
  clean?: boolean;
  numberOfLines?: number;
  ellipsizeMode?: 'head' | 'middle' | 'tail' | 'clip';
  textStyle?: StyleProp<TextStyle>;
}

export enum ParagraphFont {
  display = 'display',
  text = 'text',
}

export type ParagraphProps = TextProps &
  TxtT & {
    font?: ParagraphFont;
  };

export const Paragraph = ({
  h0,
  h1,
  h2,
  h3,
  h4,
  style,
  children,
  font = ParagraphFont.display,
  ellipsizeMode,
  numberOfLines,
  clean,
  ...props
}: ParagraphProps) => {
  const containerStyle = useMemo(
    () => [page.container, style, page[`${font}Font`]],
    [font, style],
  );
  return (
    <>
      {clean ? (
        <Text style={style}>{children}</Text>
      ) : (
        <Text
          numberOfLines={numberOfLines}
          ellipsizeMode={ellipsizeMode}
          style={[
            containerStyle,
            h0 && StyleSheet.flatten([page.h0Style, containerStyle]),
            h1 && StyleSheet.flatten([page.h1Style, containerStyle]),
            h2 && StyleSheet.flatten([page.h2Style, containerStyle]),
            h3 && StyleSheet.flatten([page.h3Style, containerStyle]),
            h4 && StyleSheet.flatten([page.h4Style, containerStyle]),
          ]}
          {...props}>
          {children}
        </Text>
      )}
    </>
  );
};

const page = StyleSheet.create({
  container: {
    fontFamily: 'SF Pro Display',
    fontStyle: 'normal',
    fontWeight: '400',
    color: TEXT_BASE_2,
  },
  h0Style: {
    fontSize: 22,
    lineHeight: 30,
  },
  h1Style: {
    fontSize: 18,
    lineHeight: 24,
  },
  h2Style: {
    fontSize: 16,
    lineHeight: 22,
  },
  h3Style: {
    fontSize: 14,
    lineHeight: 18,
  },
  h4Style: {
    fontSize: 12,
    lineHeight: 16,
  },
  displayFont: {
    fontFamily: 'SF Pro Display',
  },
  textFont: {
    fontFamily: 'SF Pro Text',
  },
});
