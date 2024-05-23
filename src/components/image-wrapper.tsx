import {useMemo} from 'react';

import {isObservable, toJS} from 'mobx';
import {Image, ImageProps} from 'react-native';

export function ImageWrapper({
  source,
  ...props
}: ImageProps | {source: string}) {
  const fixedSource = useMemo(() => {
    const getFixed1 = () => {
      // fix for error: `property is not configurable`
      if (isObservable(source)) {
        return toJS(source);
      }
      return source;
    };

    const fixed1 = getFixed1();
    if (typeof fixed1 === 'string') {
      return {uri: fixed1};
    }
    return fixed1;
  }, [source]);

  return <Image source={fixedSource} {...props} />;
}
