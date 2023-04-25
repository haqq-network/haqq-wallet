import React, {useCallback, useMemo, useState} from 'react';

import {Image, StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import Animated, {FadeIn} from 'react-native-reanimated';
import {SvgUri} from 'react-native-svg';

import {Color} from '@app/colors';
import {createTheme} from '@app/helpers';
import {getHostnameFromUrl} from '@app/utils';

import {First, Text} from './ui';

import {getFavIconUrl} from '../helpers/web3-browser-utils';

type DefaultProps = {
  title?: string;
  size?: SiteIconPreviewSize;
  style?: StyleProp<ViewStyle>;
};

export type SiteIconPreviewProps = DefaultProps &
  (
    | {
        url: string;
        directIconUrl?: string;
      }
    | {
        url?: string;
        directIconUrl: string;
      }
  );

export enum SiteIconPreviewSize {
  /**
   * width & height = 60, text = t6
   */
  s60,
  /**
   * width & height = 42, text = t8
   */
  s42,
  /**
   * width & height = 18, text = t16
   */
  s18,
}

const styles = createTheme({
  sizeBox: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    backgroundColor: Color.bg3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  s60: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  s42: {
    width: 42,
    height: 42,
    borderRadius: 12,
  },
  s18: {
    width: 18,
    height: 18,
    borderRadius: 5,
  },
});

const TEXT_PROPS_BY_SIZE_MAP = {
  [SiteIconPreviewSize.s60]: {t6: true},
  [SiteIconPreviewSize.s42]: {t8: true},
  [SiteIconPreviewSize.s18]: {t16: true},
};

const IMAGE_STYLE_BY_SIZE_MAP = {
  [SiteIconPreviewSize.s60]: styles.s60,
  [SiteIconPreviewSize.s42]: styles.s42,
  [SiteIconPreviewSize.s18]: styles.s18,
};

/**
 * @param {string} url - URL of the website whose icon is to be fetched.
 * @param {string} directIconUrl - Direct URL to the website's icon, if available.
 * - If the directIconUrl is provided, it will be used instead of fetching the icon through api.faviconkit.com.
 * - Otherwise, the component will extract the hostname from the given URL and use api.faviconkit.com to fetch the icon.
 */
export const SiteIconPreview = ({
  directIconUrl,
  url,
  title,
  style,
  size = SiteIconPreviewSize.s60,
}: SiteIconPreviewProps) => {
  const [isImageFailed, setImageFailed] = useState(false);
  const [isSvgFailed, setSvgFailed] = useState(false);

  const sizeBoxStyle = useMemo(
    () => StyleSheet.flatten([styles.sizeBox, IMAGE_STYLE_BY_SIZE_MAP[size]]),
    [size],
  );
  const containerStyle = useMemo(
    () => StyleSheet.flatten([styles.iconContainer, sizeBoxStyle, style]),
    [sizeBoxStyle, style],
  );
  const iconChar = useMemo(
    () =>
      (title || getHostnameFromUrl(directIconUrl || url))?.[0]?.toUpperCase?.(),
    [directIconUrl, title, url],
  );
  const textProps = useMemo(() => TEXT_PROPS_BY_SIZE_MAP[size], [size]);
  const imageSource = useMemo(
    () => ({
      uri: directIconUrl || getFavIconUrl(url),
    }),
    [directIconUrl, url],
  );

  const onImageError = useCallback(() => {
    setImageFailed(true);
  }, []);

  const onSvgError = useCallback(() => {
    setSvgFailed(true);
  }, []);

  return (
    <View style={containerStyle}>
      <First>
        {!isImageFailed && (
          <Animated.View entering={FadeIn} style={sizeBoxStyle}>
            <Image
              resizeMode={'center'}
              style={sizeBoxStyle}
              source={imageSource}
              onError={onImageError}
            />
          </Animated.View>
        )}
        {!isSvgFailed && (
          <Animated.View entering={FadeIn} style={sizeBoxStyle}>
            <SvgUri
              width="80%"
              height="80%"
              uri={imageSource.uri}
              onError={onSvgError}
            />
          </Animated.View>
        )}
        <Animated.View entering={FadeIn}>
          <Text center color={Color.textBase2} {...textProps}>
            {iconChar}
          </Text>
        </Animated.View>
      </First>
    </View>
  );
};
