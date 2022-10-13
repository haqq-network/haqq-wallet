import React from 'react';
import {Image, ImageProps} from 'react-native';
import {IconsName} from '../../types';

const icons = {
  'arrow-back': require('../../../assets/images/arrow-back.png'),
  clear: require('../../../assets/images/clear.png'),
  'face-id': require('../../../assets/images/face-id.png'),
  'touch-id': require('../../../assets/images/face-id.png'),
};

export type IconProps = {
  name: IconsName;
  style: ImageProps['style'];
};

export const Icon = ({name, style}: IconProps) => {
  return <Image source={icons[name]} style={style} />;
};
