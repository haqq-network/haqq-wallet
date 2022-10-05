import {StyleSheet, Text, TextProps, StyleProp, TextStyle} from 'react-native';
import * as React from 'react';
import {useMemo} from 'react';
import {TEXT_BASE_2} from '../../variables';

interface TxtT {
  p0?: boolean;
  p1?: boolean;
  p2?: boolean;
  p3?: boolean;
  p4?: boolean;
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
  p0,
  p1,
  p2,
  p3,
  p4,
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
            p0 && StyleSheet.flatten([page.h0Style, containerStyle]),
            p1 && StyleSheet.flatten([page.h1Style, containerStyle]),
            p2 && StyleSheet.flatten([page.h2Style, containerStyle]),
            p3 && StyleSheet.flatten([page.h3Style, containerStyle]),
            p4 && StyleSheet.flatten([page.h4Style, containerStyle]),
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
