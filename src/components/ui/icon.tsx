import React from 'react';
import {Image, ImageProps, Omit} from 'react-native';

const icons = {
  'arrow-back': require('../../../assets/images/arrow-back.png'),
  clear: require('../../../assets/images/clear.png'),
  'face-id': require('../../../assets/images/face-id.png'),
  'touch-id': require('../../../assets/images/face-id.png'),
};

export type IconProps = Omit<ImageProps, 'source'> & {
  name: keyof typeof icons;
};
export const Icon = ({name, ...props}: IconProps) => {
  return <Image source={icons[name]} {...props} />;
};
