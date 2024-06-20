import {useEffect, useMemo, useState} from 'react';

import {isObservable, toJS} from 'mobx';
import {
  Image,
  ImageProps,
  ImageSourcePropType,
  ImageStyle,
  StyleProp,
  StyleSheet,
} from 'react-native';
import BlastedImage, {BlastedImageProps} from 'react-native-blasted-image';

import {isValidUrl} from '@app/utils';

import {First} from './ui';

export type ImageWrapperProps = Omit<BlastedImageProps, 'source' | 'style'> & {
  source: ImageSourcePropType | string;
  style?: StyleProp<ImageStyle>;
};

export function ImageWrapper({source, style, ...props}: ImageWrapperProps) {
  const [isError, setError] = useState(false);

  const fixedSource = useMemo(() => {
    if (typeof source === 'string' && isValidUrl(source)) {
      return {uri: source} as ImageSourcePropType;
    }

    if (
      typeof source === 'object' &&
      'uri' in source &&
      typeof source.uri === 'number'
    ) {
      // if source.uri is number, that means it's a `require()` source
      return source.uri as ImageSourcePropType;
    }

    // fix for error: `property is not configurable`
    if (isObservable(source)) {
      return toJS(source) as ImageSourcePropType;
    }
    return source as ImageSourcePropType;
  }, [source]);

  useEffect(() => {
    const {width, height} = StyleSheet.flatten(style);
    if (typeof width === 'string' || typeof height === 'string') {
      setError(true);
    }
  }, [style]);

  return (
    <First>
      {isError && (
        <Image {...(props as ImageProps)} style={style} source={fixedSource} />
      )}
      <BlastedImage
        {...props}
        style={StyleSheet.flatten(style)}
        source={fixedSource}
        onError={() => setError(true)}
      />
    </First>
  );
}
