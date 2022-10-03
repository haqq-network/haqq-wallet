import {useEffect, useState} from 'react';
import {ImageResolution} from '../types';
import {getImage} from '../utils';

const cache = new Map();

cache.set('card-circles-0', require('../../assets/images/card-circles-0.png'));
cache.set('card-rhombus-0', require('../../assets/images/card-rhombus-0.png'));

export const usePattern = (pattern: string, resolution: ImageResolution) => {
  const key = `${pattern}:${resolution}`;
  const [image, setImage] = useState(cache.get(key));

  useEffect(() => {
    if (!cache.get(key)) {
      getImage(pattern, resolution).then(base64String => {
        if (base64String) {
          cache.set(key, {uri: `data:image/png;base64,${base64String}`});
        } else {
          cache.set(key, cache.get('card-circles-0'));
        }
        setImage(cache.get(key));
      });
    } else if (image !== cache.get(key)) {
      setImage(cache.get(key));
    }
  }, [key, image, pattern, resolution]);

  return image;
};
