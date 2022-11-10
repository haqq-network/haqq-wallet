import React, {useMemo} from 'react';

import {Image, ImageProps, StyleSheet} from 'react-native';

export enum IconsName {
  address_book = 'address_book',
  arrow_back = 'arrow_back',
  brush = 'brush',
  clear = 'clear',
  close_circle = 'close_circle',
  islm = 'islm',
  plus_mid = 'plus_mid',
  providers = 'providers',
  shield = 'shield',
  wallet = 'wallet',
}

export type IconProps = {
  name: IconsName | keyof typeof IconsName;
  color: string;
  xs?: boolean;
  s?: boolean;
  m?: boolean;
  style?: ImageProps['style'];
};

export const Icon = ({name, m, s, xs, style, color}: IconProps) => {
  const container = useMemo(
    () => [
      xs && styles.xsContainer,
      s && styles.sContainer,
      m && styles.mContainer,
      style,
      {tintColor: color},
    ],
    [color, m, s, style, xs],
  );
  const icon = useMemo(() => ({uri: name}), [name]);
  return <Image source={icon} style={container} />;
};

const styles = StyleSheet.create({
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
