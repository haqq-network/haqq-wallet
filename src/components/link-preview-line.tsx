import React, {useCallback, useMemo, useState} from 'react';

import {Image, View} from 'react-native';
import Animated, {FadeIn} from 'react-native-reanimated';
import {SvgUri} from 'react-native-svg';

import {Color} from '@app/colors';
import {createTheme} from '@app/helpers';

import {LinkPreviewProps} from './link-preview';
import {First, MenuNavigationButton, Spacer, Text} from './ui';
import {getFavIconUrl} from './web3-browser/web3-browser-utils';

export const LinkPreviewLine = ({
  link,
  onPress,
  hideArrow,
  disabled,
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

  return (
    <MenuNavigationButton
      disabled={disabled}
      hideArrow={hideArrow}
      style={styles.container}
      onPress={handleLinkPress}>
      <View style={styles.content}>
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
        <Spacer width={12} />
        <View style={styles.textContainer}>
          <Text t11 numberOfLines={1} style={styles.text}>
            {link.title}
          </Text>
          <Text
            t14
            numberOfLines={1}
            style={styles.text}
            color={Color.textBase2}>
            {link.url}
          </Text>
        </View>
      </View>
    </MenuNavigationButton>
  );
};

const styles = createTheme({
  textContainer: {
    alignContent: 'center',
    justifyContent: 'center',
    width: '100%',
    transform: [{translateY: -3}],
  },
  content: {
    flexDirection: 'row',
    width: '100%',
    height: 42,
  },
  text: {
    width: '85%',
  },
  container: {
    width: '100%',
    alignContent: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    backgroundColor: Color.bg3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
