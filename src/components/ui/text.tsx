import * as React from 'react';
import {useMemo} from 'react';

import {
  Platform,
  Text as RNText,
  TextProps as RNTextProps,
  StyleProp,
  StyleSheet,
  TextStyle,
} from 'react-native';

import {createTheme} from '@app/helpers';
import {I18N, getText} from '@app/i18n';
import {Color, getColor} from '@app/theme';
import {ColorType, FontT} from '@app/types';

export type TextValue =
  | {children: React.ReactNode; i18n?: undefined; i18params?: undefined}
  | {
      i18n: I18N;
      i18params?: Record<string, string>;
      children?: React.ReactNode;
    };

export enum TextVariant {
  t0 = 't0',
  t1 = 't1',
  t2 = 't2',
  t3 = 't3',
  t4 = 't4',
  t5 = 't5',
  t6 = 't6',
  t7 = 't7',
  t8 = 't8',
  t9 = 't9',
  t10 = 't10',
  t11 = 't11',
  t12 = 't12',
  t13 = 't13',
  t14 = 't14',
  t15 = 't15',
  t16 = 't16',
  t17 = 't17',
  t18 = 't18',
  u0 = 'u0',
  u1 = 'u1',
}

export enum TextPosition {
  left = 'left',
  right = 'right',
  center = 'center',
}

export type TextProps = Omit<RNTextProps, 'style' | 'children'> & {
  /** @deprecated Please use variant instead */
  t0?: boolean;
  /** @deprecated Please use variant instead */
  t1?: boolean;
  /** @deprecated Please use variant instead */
  t2?: boolean;
  /** @deprecated Please use variant instead */
  t3?: boolean;
  /** @deprecated Please use variant instead */
  t4?: boolean;
  /** @deprecated Please use variant instead */
  t5?: boolean;
  /** @deprecated Please use variant instead */
  t6?: boolean;
  /** @deprecated Please use variant instead */
  t7?: boolean;
  /** @deprecated Please use variant instead */
  t8?: boolean;
  /** @deprecated Please use variant instead */
  t9?: boolean;
  /** @deprecated Please use variant instead */
  t10?: boolean;
  /** @deprecated Please use variant instead */
  t11?: boolean;
  /** @deprecated Please use variant instead */
  t12?: boolean;
  /** @deprecated Please use variant instead */
  t13?: boolean;
  /** @deprecated Please use variant instead */
  t14?: boolean;
  /** @deprecated Please use variant instead */
  t15?: boolean;
  /** @deprecated Please use variant instead */
  t16?: boolean;
  /** @deprecated Please use variant instead */
  t17?: boolean;
  /** @deprecated Please use variant instead */
  t18?: boolean;
  /** @deprecated Please use variant instead */
  u0?: boolean;
  /** @deprecated Please use variant instead */
  u1?: boolean;

  clean?: boolean;
  /** @deprecated Please use position instead */
  center?: boolean;
  /** @deprecated Please use position instead */
  right?: boolean;
  color?: ColorType;
  style?: StyleProp<TextStyle>;
  showChildren?: boolean;
  variant?: TextVariant;
  position?: TextPosition;
} & TextValue;

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
  t18,
  u0,
  u1,
  style,
  i18n,
  i18params,
  children,
  clean,
  center,
  right,
  color,
  showChildren,
  variant,
  position,
  ...props
}: TextProps) => {
  const value = useMemo(
    () => (typeof i18n !== 'undefined' ? getText(i18n, i18params) : children),
    [children, i18n, i18params],
  );

  const variantStyle = useMemo(() => {
    if (!variant) {
      return style;
    }
    const pageVariantStyle = page[`${variant}Style`];
    if (!pageVariantStyle) {
      return style;
    }
    return StyleSheet.flatten([pageVariantStyle, style]);
  }, [variant, style]);

  const positionStyle = useMemo(() => {
    if (!position) {
      return {};
    }
    const pagePositionStyle = page[position];
    if (!pagePositionStyle) {
      return {};
    }
    return pagePositionStyle;
  }, [position]);

  return clean ? (
    <RNText style={style} allowFontScaling={false} {...props}>
      {children}
    </RNText>
  ) : (
    <RNText
      allowFontScaling={false}
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
        t18 && StyleSheet.flatten([page.t18Style, style]),
        u0 && StyleSheet.flatten([page.u0Style, style]),
        u1 && StyleSheet.flatten([page.u1Style, style]),
        variantStyle,
        !!color && {color: getColor(color as Color)},
        center && page.center,
        right && page.right,
        positionStyle,
      ]}
      {...props}>
      {value}
      {!!showChildren && children}
    </RNText>
  );
};

const sfProTextRegular400: FontT = Platform.select({
  ios: {
    fontFamily: 'SF Pro Display',
    fontWeight: '400',
  },
  android: {
    fontFamily: 'SF-Pro-Display-Regular',
  },
});

const sfProDisplayBold700: FontT = Platform.select({
  ios: {
    fontFamily: 'SF Pro Display',
    fontWeight: '700',
  },
  android: {
    fontFamily: 'SF-Pro-Display-Bold',
  },
});

const sfProDisplaySemibold600: FontT = Platform.select({
  ios: {
    fontFamily: 'SF Pro Display',
    fontWeight: '600',
  },
  android: {
    fontFamily: 'SF-Pro-Display-Semibold',
  },
});

const sfProTextMedium500: FontT = Platform.select({
  ios: {
    fontFamily: 'SF Pro Text',
    fontWeight: '600',
  },
  android: {
    fontFamily: 'SF-ProText-Semibold',
  },
});

const sfProTextSemibold600: FontT = Platform.select({
  ios: {
    fontFamily: 'SF Pro Text',
    fontWeight: '600',
  },
  android: {
    fontFamily: 'SF-ProText-Semibold',
  },
});

const sfProTextBold700: FontT = Platform.select({
  ios: {
    fontFamily: 'SF Pro Text',
    fontWeight: '700',
  },
  android: {
    fontFamily: 'SF-ProText-Bold',
  },
});

const page = createTheme({
  bold: {fontWeight: 'bold'},
  center: {
    textAlign: 'center',
  },
  right: {
    textAlign: 'right',
  },
  left: {
    textAlign: 'left',
  },
  u0Style: {
    fontStyle: 'normal',
    fontWeight: '500',
    fontSize: 36,
    lineHeight: 43,
    letterSpacing: 0.38,
  },
  u1Style: {
    fontFamily: 'SF Pro Display',
    fontStyle: 'normal',
    fontSize: 20,
    lineHeight: 25,
  },
  t0Style: {
    fontFamily: 'ElMessiri-Bold',
    fontStyle: 'normal',
    fontSize: 34,
    lineHeight: 46,
    color: Color.textBase1,
  },
  t1Style: {
    fontFamily: 'SF Pro Display',
    fontStyle: 'normal',
    fontWeight: '700',
    fontSize: 34,
    lineHeight: 46,
    color: Color.textBase1,
  },
  t2Style: {
    fontFamily: 'ElMessiri-Bold',
    fontStyle: 'normal',
    fontSize: 34,
    lineHeight: 46,
    color: Color.textBase1,
  },
  t3Style: {
    fontFamily: 'SF Pro Display',
    ...sfProDisplayBold700,
    fontStyle: 'normal',
    fontSize: 28,
    lineHeight: 38,
    color: Color.textBase1,
  },
  t4Style: {
    fontFamily: 'ElMessiri-Bold',
    fontStyle: 'normal',
    fontSize: 28,
    lineHeight: 38,
    color: Color.textBase1,
  },
  t5Style: {
    ...sfProDisplayBold700,
    fontSize: 22,
    lineHeight: 30,
    color: Color.textBase1,
  },
  t6Style: {
    ...sfProDisplaySemibold600,
    fontSize: 22,
    lineHeight: 30,
    color: Color.textBase1,
  },
  t7Style: {
    ...sfProTextBold700,
    fontSize: 18,
    lineHeight: 24,
    color: Color.textBase1,
  },
  t8Style: {
    ...sfProTextSemibold600,
    fontSize: 18,
    lineHeight: 24,
    color: Color.textBase1,
  },
  t9Style: {
    ...sfProDisplayBold700,
    fontSize: 16,
    lineHeight: 22,
    color: Color.textBase1,
  },
  t10Style: {
    ...sfProDisplaySemibold600,
    fontSize: 16,
    lineHeight: 22,
    color: Color.textBase1,
  },
  t11Style: {
    ...sfProTextRegular400,
    fontSize: 16,
    lineHeight: 22,
    color: Color.textBase1,
  },
  t12Style: {
    ...sfProDisplayBold700,
    fontSize: 14,
    lineHeight: 18,
    color: Color.textBase1,
  },
  t13Style: {
    ...sfProDisplaySemibold600,
    fontSize: 14,
    lineHeight: 18,
    color: Color.textBase1,
  },
  t14Style: {
    ...sfProTextRegular400,
    fontSize: 14,
    lineHeight: 18,
    color: Color.textBase1,
  },
  t15Style: {
    ...sfProTextRegular400,
    fontSize: 12,
    lineHeight: 16,
    color: Color.textBase1,
  },
  t16Style: {
    ...sfProTextBold700,
    fontSize: 10,
    lineHeight: 12,
    color: Color.textBase1,
  },
  t17Style: {
    ...sfProTextMedium500,
    fontSize: 10,
    lineHeight: 12,
    color: Color.textBase1,
  },
  t18Style: {
    ...sfProTextSemibold600,
    fontSize: 12,
    lineHeight: 16,
    color: Color.textBase1,
  },
});
