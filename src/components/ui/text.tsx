import React from 'react';
import {
  StyleSheet,
  Text as RNText,
  StyleProp,
  TextStyle,
  Platform,
} from 'react-native';

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
        <RNText style={style} allowFontScaling={false}>
          {children}
        </RNText>
      ) : (
        <RNText
          allowFontScaling={false}
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
    ...Platform.select({
      ios: {
        fontFamily: 'El Messiri',
        fontWeight: '700',
      },
      android: {
        fontFamily: 'ElMessiri-Bold',
      },
    }),
    fontStyle: 'normal',
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
    ...Platform.select({
      ios: {
        fontFamily: 'El Messiri',
        fontWeight: '700',
      },
      android: {
        fontFamily: 'ElMessiri-Bold',
      },
    }),
    fontStyle: 'normal',
    fontSize: 34,
    lineHeight: 46,
    color: TEXT_BASE_1,
  },
  t3Style: {
    fontFamily: 'SF Pro Display',
    ...Platform.select({
      ios: {
        fontFamily: 'SF Pro Display',
        fontWeight: '700',
      },
      android: {
        fontFamily: 'SF-Pro-Display-Bold',
      },
    }),
    fontStyle: 'normal',
    fontSize: 28,
    lineHeight: 38,
    color: TEXT_BASE_1,
  },
  t4Style: {
    ...Platform.select({
      ios: {
        fontFamily: 'El Messiri',
        fontWeight: '700',
      },
      android: {
        fontFamily: 'ElMessiri-Bold',
      },
    }),
    fontStyle: 'normal',
    fontSize: 28,
    lineHeight: 38,
    color: TEXT_BASE_1,
  },
  t5Style: {
    ...Platform.select({
      ios: {
        fontFamily: 'SF Pro Display',
        fontWeight: '600',
      },
      android: {
        fontFamily: 'SF-Pro-Display-Bold',
      },
    }),
    fontSize: 22,
    lineHeight: 30,
    color: TEXT_BASE_1,
  },
  t6Style: {
    ...Platform.select({
      ios: {
        fontFamily: 'SF Pro Display',
        fontWeight: '600',
      },
      android: {
        fontFamily: 'SF-Pro-Display-Semibold',
      },
    }),
    fontSize: 22,
    lineHeight: 30,
    color: TEXT_BASE_1,
  },
  t7Style: {
    fontFamily: 'SF Pro Text',
    ...Platform.select({
      ios: {
        fontFamily: 'SF Pro Text',
        fontWeight: '700',
      },
      android: {
        fontFamily: 'SF-ProText-Semibold',
      },
    }),
    fontSize: 18,
    lineHeight: 24,
    color: TEXT_BASE_1,
  },
  t8Style: {
    ...Platform.select({
      ios: {
        fontFamily: 'SF Pro Text',
        fontWeight: '600',
      },
      android: {
        fontFamily: 'SF-ProText-Semibold',
      },
    }),
    fontSize: 18,
    lineHeight: 24,
    color: TEXT_BASE_1,
  },
  t9Style: {
    ...Platform.select({
      ios: {
        fontFamily: 'SF Pro Display',
        fontWeight: '700',
      },
      android: {
        fontFamily: 'SF-Pro-Display-Bold',
      },
    }),
    fontSize: 16,
    lineHeight: 22,
    color: TEXT_BASE_1,
  },
  t10Style: {
    ...Platform.select({
      ios: {
        fontFamily: 'SF Pro Display',
        fontWeight: '600',
      },
      android: {
        fontFamily: 'SF-Pro-Display-Bold',
      },
    }),
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
    ...Platform.select({
      ios: {
        fontFamily: 'SF Pro Display',
        fontWeight: '700',
      },
      android: {
        fontFamily: 'SF-Pro-Display-Bold',
      },
    }),
    fontSize: 14,
    lineHeight: 18,
    color: TEXT_BASE_1,
  },
  t13Style: {
    ...Platform.select({
      ios: {
        fontFamily: 'SF Pro Display',
        fontWeight: '600',
      },
      android: {
        fontFamily: 'SF-Pro-Display-Semibold',
      },
    }),
    fontSize: 14,
    lineHeight: 18,
    color: TEXT_BASE_1,
  },
  t14Style: {
    ...Platform.select({
      ios: {
        fontFamily: 'SF Pro Display',
        fontWeight: '400',
      },
      android: {
        fontFamily: 'SF-Pro-Display-Regular',
      },
    }),
    fontSize: 14,
    lineHeight: 18,
    color: TEXT_BASE_1,
  },
  t15Style: {
    ...Platform.select({
      ios: {
        fontFamily: 'SF Pro Display',
        fontWeight: '400',
      },
      android: {
        fontFamily: 'SF-Pro-Display-Regular',
      },
    }),
    fontSize: 12,
    lineHeight: 16,
    color: TEXT_BASE_1,
  },
  t16Style: {
    ...Platform.select({
      ios: {
        fontFamily: 'SF Pro Text',
        fontWeight: '700',
      },
      android: {
        fontFamily: 'SF-ProText-Bold',
      },
    }),
    fontSize: 10,
    lineHeight: 12,
    color: TEXT_BASE_1,
  },
  t17Style: {
    ...Platform.select({
      ios: {
        fontFamily: 'SF Pro Text',
        fontWeight: '500',
      },
      android: {
        fontFamily: 'SF-ProText-Medium',
      },
    }),
    fontSize: 10,
    lineHeight: 12,
    color: TEXT_BASE_1,
  },
});
