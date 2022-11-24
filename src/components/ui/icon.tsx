import React, {useMemo} from 'react';

import {Image, ImageProps, StyleSheet} from 'react-native';

import {Color, getColor} from '@app/colors';

export enum IconsName {
  address_book = 'address_book',
  arrow_back = 'arrow_back',
  arrow_forward_small = 'arrow_forward_small',
  arrow_forward = 'arrow_forward',
  arrow_receive = 'arrow_receive',
  arrow_send = 'arrow_send',
  block = 'block',
  brush = 'brush',
  check = 'check',
  circle_clear = 'circle_clear',
  circle_pattern = 'circle_pattern',
  clear = 'clear',
  close_circle = 'close_circle',
  color_flat = 'color_flat',
  color_gradient = 'color_gradient',
  copy = 'copy',
  doc = 'doc',
  flash = 'flash',
  flashlight = 'flashlight',
  global = 'global',
  governance = 'governance',
  help = 'help',
  image = 'image',
  invoice = 'invoice',
  islm = 'islm',
  language = 'language',
  ledger = 'ledger',
  list = 'list',
  lock = 'lock',
  market = 'market',
  paste = 'paste',
  pen = 'pen',
  logo = 'logo',
  plus_big = 'plus_big',
  plus_mid = 'plus_mid',
  providers = 'providers',
  qr_code = 'qr_code',
  qr_scanner = 'qr_scanner',
  romb_pattern = 'romb_pattern',
  search = 'search',
  servers = 'servers',
  settings = 'settings',
  shield = 'shield',
  staking = 'staking',
  star = 'star',
  swap = 'swap',
  trash = 'trash',
  up = 'up',
  user = 'user',
  wallet = 'wallet',
  warning = 'warning',
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
      {tintColor: getColor(color as Color)},
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
