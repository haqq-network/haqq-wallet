import React, {useCallback, useMemo, useState} from 'react';

import {
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import {Color, getColor} from '@app/colors';
import {useLayout} from '@app/hooks/use-layout';
import {Banner, BannerButton, BannerButtonEvent} from '@app/models/banner';
import {sleep} from '@app/utils';
import {GRADIENT_END, GRADIENT_START} from '@app/variables/common';

import {ImageWrapper} from './image-wrapper';
import {
  Button,
  ButtonSize,
  ButtonVariant,
  First,
  Icon,
  IconButton,
  Inline,
  Spacer,
  Text,
} from './ui';

export interface HomeBannerProps {
  banner: Banner;
  style?: StyleProp<ViewStyle>;
  onPress: (
    id: string,
    event: BannerButtonEvent,
    params?: object,
    button?: BannerButton,
  ) => Promise<void>;
}

export const HomeBanner = ({banner, style, onPress}: HomeBannerProps) => {
  const [loading, setLoading] = useState(false);
  const [isVisible, setVisible] = useState(true);
  const showCloseButton = useMemo(
    () => banner.closeEvent && banner.closeEvent !== BannerButtonEvent.none,
    [banner],
  );

  const image = useMemo(() => {
    if (banner.backgroundImage?.startsWith?.('http')) {
      return {
        uri: banner.backgroundImage,
      };
    }
    switch (banner.backgroundImage) {
      case 'banner_notifications':
        return require('@assets/images/banner_notifications.png');
      case 'banner_news':
        return require('@assets/images/banner_news.png');
      case 'banner_analytics':
        return require('@assets/images/banner_analytics.png');
      default:
        return require('@assets/images/export-banner-bg.png');
    }
  }, [banner]);

  const onPressClose = useCallback(async () => {
    setVisible(false);
    await onPress(
      banner.id,
      banner.closeEvent || BannerButtonEvent.empty,
      banner.closeParams,
    );
  }, [banner, onPress]);

  const onPressBack = useCallback(async () => {
    await onPress(
      banner.id,
      banner.defaultEvent || BannerButtonEvent.empty,
      banner.defaultParams,
    );
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

  const [layout, onLayout] = useLayout();

  const elem = useMemo(
    () => (
      <View onLayout={onLayout} style={[styles.container, borderStyle, style]}>
        <First>
          {!!banner.backgroundImage && (
            <ImageWrapper
              resizeMode="cover"
              style={[
                styles.inner,
                {width: layout.width, height: layout.height},
              ]}
              source={image}
            />
          )}

          <LinearGradient
            colors={[
              banner.backgroundColorFrom || '',
              banner.backgroundColorTo || '',
            ]}
            start={GRADIENT_START}
            end={GRADIENT_END}
            style={styles.inner}
          />
        </First>
        <Text color={banner.titleColor ?? Color.textBase3} t10>
          {banner.title}
        </Text>
        {banner.description && (
          <Text
            style={styles.description}
            color={banner.descriptionColor ?? Color.textBase3}
            t14>
            {banner.description}
          </Text>
        )}
        <Spacer height={12} />
        {banner.buttons && (
          <Inline gap={20}>
            {banner.buttons.map((button: BannerButton) => (
              <Button
                key={'banner_' + banner.id}
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
        {showCloseButton && (
          <IconButton style={styles.closeButton} onPress={onPressClose}>
            <Icon
              name="close_circle"
              color={banner.closeButtonColor ?? Color.graphicBase3}
            />
          </IconButton>
        )}
      </View>
    ),
    [borderStyle, style, banner, onPressClose, loading, onPressBanner, layout],
  );

  if (!isVisible) {
    return null;
  }

  if (!banner.buttons?.length && banner.defaultEvent) {
    return <TouchableOpacity onPress={onPressBack}>{elem}</TouchableOpacity>;
  }

  return elem;
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 5,
    minHeight: 100,
    flex: 1,
  },
  inner: {
    borderRadius: 16,
    ...StyleSheet.absoluteFillObject,
  },
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    opacity: 0.8,
  },
  description: {
    opacity: 0.7,
  },
});
