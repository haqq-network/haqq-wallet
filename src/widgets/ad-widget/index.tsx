import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import {
  Image,
  LayoutChangeEvent,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import {Color, getColor} from '@app/colors';
import {
  Button,
  ButtonSize,
  ButtonVariant,
  Icon,
  IconButton,
  Inline,
  Spacer,
  Text,
} from '@app/components/ui';
import {ShadowCard} from '@app/components/ui/shadow-card';
import {getWindowDimensions} from '@app/helpers';
import {Banner, BannerButton} from '@app/models/banner';
import {sleep} from '@app/utils';
import {GRADIENT_END, GRADIENT_START} from '@app/variables/common';

export interface HomeBannerProps {
  banner: Banner;
  style?: StyleProp<ViewStyle>;
  onPress: (
    id: string,
    event: string,
    params?: object,
    button?: BannerButton,
  ) => Promise<void>;
}

export const AdWidget = ({banner, style, onPress}: HomeBannerProps) => {
  const [loading, setLoading] = useState(false);
  const [isVisible, setVisible] = useState(true);
  const widthRef = useRef(0);
  const [isSmall, setIsSmall] = useState(false);

  const onPressClose = useCallback(async () => {
    setVisible(false);
    await onPress(banner.id, banner.closeEvent, banner.closeParams);
  }, [banner, onPress]);

  const onPressBack = useCallback(async () => {
    await onPress(banner.id, banner.defaultEvent, banner.defaultParams);
  }, [banner, onPress]);

  const onPressBanner = useCallback(
    (button: BannerButton) => async () => {
      setLoading(true);
      await sleep(250);
      await onPress(banner.id, button.event, button.params, button);
      setLoading(false);
    },
    [banner, onPress],
  );

  const borderStyle = useMemo(() => {
    if (banner.backgroundBorder) {
      return {
        borderWidth: 1,
        borderColor: getColor(banner.backgroundBorder),
      };
    }

    return {};
  }, [banner]);

  const onLayout = ({nativeEvent}: LayoutChangeEvent) => {
    widthRef.current = nativeEvent.layout.width;
  };

  const window = getWindowDimensions();

  useEffect(() => {
    if (widthRef.current) {
      setIsSmall(widthRef.current <= window.width / 2);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [widthRef.current, window.width]);

  const elem = useMemo(
    () => (
      <View
        onLayout={onLayout}
        style={[styles.container, borderStyle, style, isSmall && styles.small]}>
        {banner.backgroundImage ? (
          <Image
            resizeMode="cover"
            style={styles.inner}
            source={{uri: banner.backgroundImage}}
          />
        ) : (
          <LinearGradient
            colors={[banner.backgroundColorFrom, banner.backgroundColorTo]}
            start={GRADIENT_START}
            end={GRADIENT_END}
            style={styles.inner}
          />
        )}
        <Text color={banner.titleColor ?? Color.textBase1} t8>
          {banner.title}
        </Text>
        {banner.description && (
          <Text
            style={styles.description}
            color={banner.descriptionColor ?? Color.textBase2}
            t15>
            {banner.description}
          </Text>
        )}
        <Spacer height={12} />
        {banner.buttons && (
          <Inline gap={20}>
            {banner.buttons.map(button => (
              <Button
                key={banner.id}
                loading={loading}
                onPress={onPressBanner(button)}
                color={button.backgroundColor}
                textColor={button.color}
                loadingColor={button.color}
                variant={ButtonVariant.contained}
                size={ButtonSize.small}
                title={button.title}
              />
            ))}
          </Inline>
        )}
        {banner.closeEvent && (
          <IconButton style={styles.closeButton} onPress={onPressClose}>
            <Icon
              name="close_circle"
              color={banner.closeButtonColor ?? Color.graphicBase3}
            />
          </IconButton>
        )}
      </View>
    ),
    [borderStyle, style, banner, onPressClose, loading, onPressBanner, isSmall],
  );

  if (!isVisible) {
    return <View style={styles.removeLeftMargin} />;
  }

  return (
    <ShadowCard style={styles.removePaddingVertical} onPress={onPressBack}>
      {elem}
    </ShadowCard>
  );
};

const styles = StyleSheet.create({
  removePaddingVertical: {paddingVertical: 0},
  removeLeftMargin: {marginLeft: -20},
  container: {
    borderRadius: 13,
    padding: 16,
    flex: 1,
    height: 111,
  },
  inner: {
    borderRadius: 13,
    ...StyleSheet.absoluteFillObject,
  },
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    opacity: 0.8,
  },
  description: {
    marginTop: 8,
  },
  small: {
    height: 188,
  },
});
