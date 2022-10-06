import {StyleSheet, Text as RNText, StyleProp, TextStyle} from 'react-native';
import * as React from 'react';
import {TEXT_BASE_1} from '../../variables';

interface TxtT {
  t0?: boolean;
  t1?: boolean;
  t2?: boolean;
  t3?: boolean;
  t4?: boolean;
  t5?: boolean;
  t6?: boolean;
  t7?: boolean;
  t8?: boolean;
  t9?: boolean;
  t10?: boolean;
  t11?: boolean;
  t12?: boolean;
  t13?: boolean;
  t14?: boolean;
  t15?: boolean;
  t16?: boolean;
  t17?: boolean;
  clean?: boolean;
  numberOfLines?: number;
  ellipsizeMode?: 'head' | 'middle' | 'tail' | 'clip';
  style?: StyleProp<TextStyle>;
  children: React.ReactNode;
}

export const Text = ({
  t0,
  t1,
  t2,
  t3,
  t4,
  t5,
  t6,
  t7,
  t8,
  t9,
  t10,
  t11,
  t12,
  t13,
  t14,
  t15,
  t16,
  t17,
  style,
  children,
  ellipsizeMode,
  numberOfLines,
  clean,
  ...props
}: TxtT) => {
  return (
    <>
      {clean ? (
        <RNText style={style}>{children}</RNText>
      ) : (
        <RNText
          numberOfLines={numberOfLines}
          ellipsizeMode={ellipsizeMode}
          style={[
            t0 && StyleSheet.flatten([page.t0Style, style]),
            t1 && StyleSheet.flatten([page.t1Style, style]),
            t2 && StyleSheet.flatten([page.t2Style, style]),
            t3 && StyleSheet.flatten([page.t3Style, style]),
            t4 && StyleSheet.flatten([page.t4Style, style]),
            t5 && StyleSheet.flatten([page.t5Style, style]),
            t6 && StyleSheet.flatten([page.t6Style, style]),
            t7 && StyleSheet.flatten([page.t7Style, style]),
            t8 && StyleSheet.flatten([page.t8Style, style]),
            t9 && StyleSheet.flatten([page.t9Style, style]),
            t10 && StyleSheet.flatten([page.t10Style, style]),
            t11 && StyleSheet.flatten([page.t11Style, style]),
            t12 && StyleSheet.flatten([page.t12Style, style]),
            t13 && StyleSheet.flatten([page.t13Style, style]),
            t14 && StyleSheet.flatten([page.t14Style, style]),
            t15 && StyleSheet.flatten([page.t15Style, style]),
            t16 && StyleSheet.flatten([page.t16Style, style]),
            t17 && StyleSheet.flatten([page.t17Style, style]),
          ]}
          {...props}>
          {children}
        </RNText>
      )}
    </>
  );
};

const page = StyleSheet.create({
  t0Style: {
    fontFamily: 'El Messiri',
    fontStyle: 'normal',
    fontWeight: '700',
    fontSize: 34,
    lineHeight: 46,
    color: TEXT_BASE_1,
  },
  t1Style: {
    fontFamily: 'SF Pro Display',
    fontStyle: 'normal',
    fontWeight: '700',
    fontSize: 34,
    lineHeight: 46,
    color: TEXT_BASE_1,
  },
  t2Style: {
    fontFamily: 'El Messiri',
    fontStyle: 'normal',
    fontWeight: '700',
    fontSize: 34,
    lineHeight: 46,
    color: TEXT_BASE_1,
  },
  t3Style: {
    fontFamily: 'SF Pro Display',
    fontStyle: 'normal',
    fontWeight: '700',
    fontSize: 28,
    lineHeight: 38,
    color: TEXT_BASE_1,
  },
  t4Style: {
    //title
    fontFamily: 'El Messiri',
    fontStyle: 'normal',
    fontWeight: '700',
    fontSize: 28,
    lineHeight: 38,
    color: TEXT_BASE_1,
  },
  t5Style: {
    fontFamily: 'SF Pro Display',
    fontWeight: '700',
    fontSize: 22,
    lineHeight: 30,
    color: TEXT_BASE_1,
  },
  t6Style: {
    fontFamily: 'SF Pro Display',
    fontWeight: '600',
    fontSize: 22,
    lineHeight: 30,
    color: TEXT_BASE_1,
  },
  t7Style: {
    fontFamily: 'SF Pro Text',
    fontWeight: '700',
    fontSize: 18,
    lineHeight: 24,
    color: TEXT_BASE_1,
  },
  t8Style: {
    fontFamily: 'SF Pro Text',
    fontWeight: '600',
    fontSize: 18,
    lineHeight: 24,
    color: TEXT_BASE_1,
  },
  t9Style: {
    fontFamily: 'SF Pro Display',
    fontWeight: '700',
    fontSize: 16,
    lineHeight: 22,
    color: TEXT_BASE_1,
  },
  t10Style: {
    fontFamily: 'SF Pro Display',
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 22,
    color: TEXT_BASE_1,
  },
  t11Style: {
    fontFamily: 'SF Pro Display',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 22,
    color: TEXT_BASE_1,
  },
  t12Style: {
    fontFamily: 'SF Pro Display',
    fontWeight: '700',
    fontSize: 14,
    lineHeight: 18,
    color: TEXT_BASE_1,
  },
  t13Style: {
    fontFamily: 'SF Pro Display',
    fontWeight: '600',
    fontSize: 14,
    lineHeight: 18,
    color: TEXT_BASE_1,
  },
  t14Style: {
    fontFamily: 'SF Pro Display',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 18,
    color: TEXT_BASE_1,
  },
  t15Style: {
    fontFamily: 'SF Pro Display',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    color: TEXT_BASE_1,
  },
  t16Style: {
    fontFamily: 'SF Pro Text',
    fontWeight: '700',
    fontSize: 10,
    lineHeight: 12,
    color: TEXT_BASE_1,
  },
  t17Style: {
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 10,
    lineHeight: 12,
    color: TEXT_BASE_1,
  },
});
