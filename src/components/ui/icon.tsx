import React, {useMemo} from 'react';

import {Image, ImageProps, StyleSheet} from 'react-native';

export enum IconsName {
  addressBook = 'addressBook',
  arrowBack = 'arrowBack',
  brush = 'brush',
  clear = 'clear',
  closeCircle = 'closeCircle',
  islm = 'islm',
  plusMid = 'plusMid',
  providers = 'providers',
  shield = 'shield',
  wallet = 'wallet',
}

export type IconProps = {
  name: IconsName | keyof typeof IconsName;
  color: string;
  xs?: boolean;
  s?: boolean;
  style?: ImageProps['style'];
};

export const Icon = ({name, s, xs, style, color}: IconProps) => {
  const container = useMemo(
    () => [
      xs && styles.xsContainer,
      s && styles.sContainer,
      style,
      {tintColor: color},
    ],
    [color, s, style, xs],
  );
  const icon = useMemo(() => ({uri: name}), [name]);
  return <Image source={icon} style={container} />;
};

const styles = StyleSheet.create({
  sContainer: {
    width: 24,
    height: 24,
  },
  xsContainer: {
    width: 12,
    height: 12,
  },
});
