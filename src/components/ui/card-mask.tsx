import React from 'react';

import {Image, ImageProps} from 'react-native';

export const CardMask = ({style}: Omit<ImageProps, 'source'>) => (
  <Image source={require('@assets/images/card-maks.png')} style={style} />
);
