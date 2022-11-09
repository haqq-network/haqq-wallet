import React from 'react';
import {Image, ImageProps} from 'react-native';
import {IconsName} from '../../types';

const icons = {
  clear: require('../../../assets/images/clear.png'),
};

export type IconProps = {
  name: IconsName;
  style: ImageProps['style'];
};

export const Icon = ({name, style}: IconProps) => {
  return <Image source={icons[name]} style={style} />;
};
