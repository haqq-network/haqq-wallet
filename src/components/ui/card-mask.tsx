import {Image, ImageProps} from 'react-native';
import React from 'react';

const mask = require('../../../assets/images/card-maks.png');

export const CardMask = ({style}: Omit<ImageProps, 'source'>) => (
  <Image source={mask} style={style} />
);
