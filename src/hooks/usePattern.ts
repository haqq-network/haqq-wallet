import {useEffect, useState} from 'react';
import {ImageResolution} from '../types';
import {getImage} from '../utils';

const cache = new Map();

export const usePattern = (pattern: string, resolution: ImageResolution) => {
  const key = `${pattern}:${resolution}`;
  const [image, setImage] = useState(cache.get(key));

  useEffect(() => {
    if (!cache.get(key)) {
      getImage(pattern, resolution).then(base64String => {
        if (base64String) {
          cache.set(key, base64String);
          setImage(base64String);
        }
      });
    } else {
      if (image !== cache.get(key)) {
        setImage(cache.get(key));
      }
    }
  }, [key, image, pattern, resolution]);

  return image ? {uri: `data:image/png;base64,${image}`} : null;
};
