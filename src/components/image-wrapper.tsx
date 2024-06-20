import {useEffect, useMemo, useState} from 'react';

import {isObservable, toJS} from 'mobx';
import {
  Image,
  ImageSourcePropType,
  ImageStyle,
  StyleProp,
  StyleSheet,
} from 'react-native';
import BlastedImage, {BlastedImageProps} from 'react-native-blasted-image';

import {isValidUrl} from '@app/utils';

export type ImageWrapperProps = Omit<BlastedImageProps, 'source' | 'style'> & {
  source: ImageSourcePropType | string;
  style?: StyleProp<ImageStyle>;
};

export function ImageWrapper({source, style, ...props}: ImageWrapperProps) {
  const [isError, setError] = useState(false);
  const Component = isError ? Image : BlastedImage;

  const fixedSource = useMemo(() => {
    if (typeof source === 'string' && isValidUrl(source)) {
      return {uri: source} as ImageSourcePropType;
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
    <Component
      {...props}
      style={StyleSheet.flatten(style)}
      source={fixedSource}
      onError={() => setError(true)}
    />
  );
}
