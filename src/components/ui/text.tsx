import * as React from 'react';
import {useMemo} from 'react';

import {
  Platform,
  Text as RNText,
  TextProps as RNTextProps,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from 'react-native';

import {Color} from '@app/colors';
import {useTheme} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {FontT} from '@app/types';

export type TextValue =
  | {children: React.ReactNode; i18n?: undefined; i18params?: undefined}
  | {i18n: I18N; i18params?: Record<string, string>; children?: undefined};

export type TextProps = Omit<RNTextProps, 'style' | 'children'> & {
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
  t18?: boolean;
  u0?: boolean;
  u1?: boolean;
  clean?: boolean;
  center?: boolean;
  right?: boolean;
  color?: Color;
  style?: StyleProp<ViewStyle>;
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
  color = Color.textBase1,
  ...props
}: TextProps) => {
  const value = useMemo(
    () => (typeof i18n !== 'undefined' ? getText(i18n, i18params) : children),
    [children, i18n, i18params],
  );
  const {colors} = useTheme();

  return clean ? (
    <RNText style={style} allowFontScaling={false} {...props}>
      {children}
    </RNText>
  ) : (
    <RNText
      allowFontScaling={false}
      style={[
        t0 && styles.t0Style,
        t1 && styles.t1Style,
        t2 && styles.t2Style,
        t3 && styles.t3Style,
        t4 && styles.t4Style,
        t5 && styles.t5Style,
        t6 && styles.t6Style,
        t7 && styles.t7Style,
        t8 && styles.t8Style,
        t9 && styles.t9Style,
        t10 && styles.t10Style,
        t11 && styles.t11Style,
        t12 && styles.t12Style,
        t13 && styles.t13Style,
        t14 && styles.t14Style,
        t15 && styles.t15Style,
        t16 && styles.t16Style,
        t17 && styles.t17Style,
        t18 && styles.t18Style,
        u0 && styles.u0Style,
        u1 && styles.u1Style,
        !!color && {color: colors[color]},
        !!style && style,
        center && styles.center,
        right && styles.right,
      ]}
      {...props}>
      {value}
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

const styles = StyleSheet.create({
  center: {
    textAlign: 'center',
  },
  right: {
    textAlign: 'right',
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
  },
  t1Style: {
    fontFamily: 'SF Pro Display',
    fontStyle: 'normal',
    fontWeight: '700',
    fontSize: 34,
    lineHeight: 46,
  },
  t2Style: {
    fontFamily: 'ElMessiri-Bold',
    fontStyle: 'normal',
    fontSize: 34,
    lineHeight: 46,
  },
  t3Style: {
    fontFamily: 'SF Pro Display',
    ...sfProDisplayBold700,
    fontStyle: 'normal',
    fontSize: 28,
    lineHeight: 38,
  },
  t4Style: {
    fontFamily: 'ElMessiri-Bold',
    fontStyle: 'normal',
    fontSize: 28,
    lineHeight: 38,
  },
  t5Style: {
    ...sfProDisplayBold700,
    fontSize: 22,
    lineHeight: 30,
  },
  t6Style: {
    ...sfProDisplaySemibold600,
    fontSize: 22,
    lineHeight: 30,
  },
  t7Style: {
    ...sfProTextBold700,
    fontSize: 18,
    lineHeight: 24,
  },
  t8Style: {
    ...sfProTextSemibold600,
    fontSize: 18,
    lineHeight: 24,
  },
  t9Style: {
    ...sfProDisplayBold700,
    fontSize: 16,
    lineHeight: 22,
  },
  t10Style: {
    ...sfProDisplaySemibold600,
    fontSize: 16,
    lineHeight: 22,
  },
  t11Style: {
    ...sfProTextRegular400,
    fontSize: 16,
    lineHeight: 22,
  },
  t12Style: {
    ...sfProDisplayBold700,
    fontSize: 14,
    lineHeight: 18,
  },
  t13Style: {
    ...sfProDisplaySemibold600,
    fontSize: 14,
    lineHeight: 18,
  },
  t14Style: {
    ...sfProTextRegular400,
    fontSize: 14,
    lineHeight: 18,
  },
  t15Style: {
    ...sfProTextRegular400,
    fontSize: 12,
    lineHeight: 16,
  },
  t16Style: {
    ...sfProTextBold700,
    fontSize: 10,
    lineHeight: 12,
  },
  t17Style: {
    ...sfProTextMedium500,
    fontSize: 10,
    lineHeight: 12,
  },
  t18Style: {
    ...sfProTextSemibold600,
    fontSize: 12,
    lineHeight: 16,
  },
});
