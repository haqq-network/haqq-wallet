import React from 'react';

import {Image, ImageProps} from 'react-native';

const mask = require('@assets/images/card-maks.png');

export const CardMask = ({style}: Omit<ImageProps, 'source'>) => (
  <Image source={mask} style={style} />
);
