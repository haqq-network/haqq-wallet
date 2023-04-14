import React, {useCallback, useMemo, useState} from 'react';

import {Image, TouchableOpacity, View} from 'react-native';
import Animated, {FadeIn} from 'react-native-reanimated';
import {SvgUri} from 'react-native-svg';

import {Color} from '@app/colors';
import {createTheme} from '@app/helpers';

import {LinkPreviewProps} from './link-preview';
import {First, Text} from './ui';
import {getFavIconUrl} from './web3-browser/web3-browser-utils';

export const LinkPreviewSquare = ({
  link,
  disabled,
  onPress,
}: LinkPreviewProps) => {
  const [isImageFailed, setImageFailed] = useState(false);
  const [isSvgFailed, setSvgFailed] = useState(false);

  const imageSource = useMemo(
    () => ({
      uri: link.icon ? link.icon : getFavIconUrl(link.url),
    }),
    [link],
  );

  const handleLinkPress = useCallback(() => {
    onPress?.(link);
  }, [link, onPress]);

  const onImageError = useCallback(() => {
    setImageFailed(true);
  }, []);

  const onSvgError = useCallback(() => {
    setSvgFailed(true);
  }, []);

  const WrapperComponent = useMemo(
    () => (disabled ? View : TouchableOpacity),
    [disabled],
  );

  return (
    // @ts-ignore
    <WrapperComponent style={styles.container} onPress={handleLinkPress}>
      <View style={[styles.iconContainer, styles.sizeBox]}>
        <First>
          {!isImageFailed && (
            <Animated.View entering={FadeIn} style={styles.sizeBox}>
              <Image
                resizeMode={'center'}
                style={styles.sizeBox}
                source={imageSource}
                onError={onImageError}
              />
            </Animated.View>
          )}
          {!isSvgFailed && (
            <Animated.View entering={FadeIn} style={styles.sizeBox}>
              <SvgUri
                width="80%"
                height="80%"
                uri={imageSource.uri}
                onError={onSvgError}
              />
            </Animated.View>
          )}
          <Animated.View entering={FadeIn}>
            <Text center t6>
              {link?.title?.[0]?.toUpperCase?.()}
            </Text>
          </Animated.View>
        </First>
      </View>
      <Text t15 numberOfLines={1} style={styles.title}>
        {link.title}
      </Text>
    </WrapperComponent>
  );
};

const styles = createTheme({
  container: {
    width: 60,
  },
  iconContainer: {
    backgroundColor: Color.bg3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeBox: {
    width: 60,
    height: 60,
    borderRadius: 12,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    width: 60,
    maxWidth: 60,
  },
});
