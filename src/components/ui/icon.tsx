import React, {useMemo} from 'react';

import {Image, ImageProps, StyleSheet} from 'react-native';

export enum IconsName {
  address_book = 'address_book',
  arrow_back = 'arrow_back',
  arrow_forward = 'arrow_forward',
  brush = 'brush',
  clear = 'clear',
  close_circle = 'close_circle',
  islm = 'islm',
  logo = 'logo',
  plus_mid = 'plus_mid',
  providers = 'providers',
  settings = 'settings',
  shield = 'shield',
  wallet = 'wallet',
}

export type IconSize =
  | {xs: boolean}
  | {s: boolean}
  | {m: boolean}
  | {xl: boolean}
  | {xxl: boolean};

export type IconProps = {
  name: IconsName | keyof typeof IconsName;
  color: string;
  style?: ImageProps['style'];
} & IconSize;

export const Icon = ({name, m, s, xs, xl, xxl, style, color}: IconProps) => {
  const container = useMemo(
    () => [
      xs && styles.xsContainer,
      s && styles.sContainer,
      m && styles.mContainer,
      xl && styles.xlContainer,
      xxl && styles.xxlContainer,
      style,
      {tintColor: color},
    ],
    [color, m, s, style, xl, xs, xxl],
  );
  const icon = useMemo(() => ({uri: name}), [name]);
  return <Image source={icon} style={container} />;
};

const styles = StyleSheet.create({
  xxlContainer: {
    width: 120,
    height: 120,
  },
  xlContainer: {
    width: 72,
    height: 72,
  },
  mContainer: {
    width: 32,
    height: 32,
  },
  sContainer: {
    width: 24,
    height: 24,
  },
  xsContainer: {
    width: 12,
    height: 12,
  },
});
