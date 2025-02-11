import {useEffect, useMemo, useState} from 'react';

import {isObservable, toJS} from 'mobx';
import {
  Image,
  ImageProps,
  ImageSourcePropType,
  ImageStyle,
  ImageURISource,
  StyleProp,
  StyleSheet,
} from 'react-native';
import BlastedImage, {BlastedImageProps} from 'react-native-blasted-image';
import WebView from 'react-native-webview';

import {isValidUrl} from '@app/utils';

import {First} from './ui';

export type ImageWrapperProps = Omit<BlastedImageProps, 'source' | 'style'> & {
  source: ImageSourcePropType | string | null;
  style?: StyleProp<ImageStyle>;
};

const SVG_MIME_TYPE = 'data:image/svg+xml;base64,';

export function ImageWrapper({source, style, ...props}: ImageWrapperProps) {
  const [isError, setError] = useState(false);

  const fixedSource = useMemo(() => {
    if (!source) {
      return undefined;
    }

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

    if (typeof source === 'number') {
      return source as ImageSourcePropType;
    }

    if (!(source as ImageURISource).uri) {
      return undefined;
    }

    return source as ImageSourcePropType;
  }, [source]);

  const isSVG = useMemo(() => {
    if (Array.isArray(fixedSource)) {
      return false;
    }

    if (typeof fixedSource === 'number') {
      return false;
    }

    if (typeof fixedSource === 'object' && 'uri' in fixedSource) {
      return fixedSource.uri?.startsWith?.(SVG_MIME_TYPE);
    }

    if (typeof fixedSource === 'string') {
      // @ts-ignore
      return fixedSource.startsWith(SVG_MIME_TYPE);
    }

    return false;
  }, [fixedSource]);

  const svgImageData = useMemo(() => {
    if (!isSVG) {
      return null;
    }

    const svg =
      //@ts-ignore
      typeof fixedSource === 'string' ? fixedSource : fixedSource?.uri;

    return svg;
  }, [fixedSource, isSVG]);

  useEffect(() => {
    const {width, height} = StyleSheet.flatten(style);
    if (typeof width === 'string' || typeof height === 'string') {
      setError(true);
    }
  }, [style]);

  return (
    <First>
      {isSVG && (
        <WebView
          useWebView2
          cacheEnabled
          cacheMode="LOAD_CACHE_ONLY"
          style={StyleSheet.flatten(style)}
          containerStyle={StyleSheet.flatten(style)}
          source={{
            html: `<img src="${svgImageData}" width="100%" height="100%" />`,
          }}
        />
      )}
      {!fixedSource && false}
      {isError && (
        <Image
          {...(props as ImageProps)}
          style={StyleSheet.flatten(style)}
          source={fixedSource!}
        />
      )}
      <BlastedImage
        {...props}
        style={StyleSheet.flatten(style)}
        // @ts-ignore
        source={fixedSource}
        onError={() => setError(true)}
      />
    </First>
  );
}
