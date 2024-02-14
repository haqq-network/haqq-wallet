import {useMemo} from 'react';

import {isObservable, toJS} from 'mobx';
import {Image, ImageProps} from 'react-native';

export function ImageWrapper({source, ...props}: ImageProps) {
  const fixedSource = useMemo(() => {
    // fix for error: `property is not configurable`
    if (isObservable(source)) {
      return toJS(source);
    }
    return source;
  }, [source]);

  return <Image source={fixedSource} {...props} />;
}
