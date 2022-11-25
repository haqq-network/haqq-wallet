import React, {useMemo} from 'react';

import {Image, ImageStyle, StyleProp, StyleSheet} from 'react-native';

import {Color, getColor} from '@app/colors';

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
  staking = 'staking',
  ledger = 'ledger',
}

export type IconSize =
  | {i12: boolean}
  | {i24: boolean}
  | {i32: boolean}
  | {i72: boolean}
  | {i120: boolean}
  | {};

export type IconProps = {
  name: IconsName | keyof typeof IconsName;
  color: string | Color;
  style?: StyleProp<ImageStyle>;
} & IconSize;

export const Icon = ({name, style, color, ...props}: IconProps) => {
  const container = useMemo(
    () =>
      StyleSheet.flatten([
        styles.i24Container,
        'i12' in props && styles.i12Container,
        'i24' in props && styles.i24Container,
        'i32' in props && styles.i32Container,
        'i72' in props && styles.i72Container,
        'i120' in props && styles.i120Container,
        style,
        {tintColor: getColor(color as Color)},
      ]),
    [color, props, style],
  );
  const icon = useMemo(() => ({uri: name}), [name]);
  return <Image source={icon} style={container} />;
};

const styles = StyleSheet.create({
  i120Container: {
    width: 120,
    height: 120,
  },
  i72Container: {
    width: 72,
    height: 72,
  },
  i32Container: {
    width: 32,
    height: 32,
  },
  i24Container: {
    width: 24,
    height: 24,
  },
  i12Container: {
    width: 12,
    height: 12,
  },
});
