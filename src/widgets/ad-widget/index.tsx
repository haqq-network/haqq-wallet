import React, {useCallback, useMemo, useRef, useState} from 'react';

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
import {onDeepLink} from '@app/event-actions/on-deep-link';
import {getWindowDimensions} from '@app/helpers';
import {BannerButtonEvent} from '@app/models/banner';
import {EventTracker} from '@app/services/event-tracker';
import {IAdWidget} from '@app/types';
import {openWeb3Browser} from '@app/utils';
import {GRADIENT_END, GRADIENT_START} from '@app/variables/common';

export interface HomeBannerProps {
  banner: IAdWidget;
  style?: StyleProp<ViewStyle>;
}

export const AdWidget = ({banner, style}: HomeBannerProps) => {
  const [loading, setLoading] = useState(false);
  const [isVisible, setVisible] = useState(true);
  const widthRef = useRef(0);
  const [isSmall, setIsSmall] = useState(false);
  const window = getWindowDimensions();

  const showCloseButton = useMemo(
    () => banner.closeEvent && banner.closeEvent !== BannerButtonEvent.none,
    [banner],
  );

  const onPressClose = useCallback(async () => {
    setVisible(false);
  }, []);

  const onPressBanner = useCallback(async () => {
    if (banner.event) {
      EventTracker.instance.trackEvent(banner.event);
    }

    setLoading(true);
    const link = banner.target;
    if (!link) {
      return;
    }
    if (link.startsWith('haqq:')) {
      const isHandled = onDeepLink(link);
      if (!isHandled) {
        openWeb3Browser(link);
      }
    } else {
      openWeb3Browser(link);
    }
    setLoading(false);
  }, [banner]);

  const borderStyle = useMemo(() => {
    if (banner.backgroundBorder) {
      return {
        borderWidth: 1,
        borderColor: getColor(banner.backgroundBorder),
      };
    }

    return {};
  }, [banner]);

  const onLayout = useCallback(
    ({nativeEvent}: LayoutChangeEvent) => {
      widthRef.current = nativeEvent.layout.width;
      setIsSmall(widthRef.current <= window.width / 2);
    },
    [window.width],
  );

  const elem = useMemo(
    () => (
      <View
        onLayout={onLayout}
        style={[styles.container, borderStyle, style, isSmall && styles.small]}>
        {banner.backgroundColorFrom && banner.backgroundColorTo && (
          <LinearGradient
            colors={[
              getColor(banner.backgroundColorFrom || Color.bg1),
              getColor(banner.backgroundColorTo || Color.bg1),
            ]}
            start={GRADIENT_START}
            end={GRADIENT_END}
            style={styles.inner}
          />
        )}
        {banner.backgroundImage && (
          <Image
            resizeMode="cover"
            style={styles.inner}
            source={{uri: banner.backgroundImage}}
          />
        )}
        <Text color={getColor(banner.titleColor ?? Color.textBase1)} t8>
          {banner.title}
        </Text>
        {banner.description && (
          <Text
            style={styles.description}
            color={getColor(banner.descriptionColor ?? Color.textBase2)}
            t15>
            {banner.description}
          </Text>
        )}
        {banner.buttons && (
          <>
            <Spacer height={12} />
            <Inline gap={20}>
              {banner.buttons.map(button => (
                <Button
                  key={banner.id}
                  loading={loading}
                  color={getColor(button.backgroundColor)}
                  textColor={button.color}
                  loadingColor={button.color}
                  variant={ButtonVariant.contained}
                  size={ButtonSize.small}
                  title={button.title}
                />
              ))}
            </Inline>
          </>
        )}
        {showCloseButton && (
          <IconButton style={styles.closeButton} onPress={onPressClose}>
            <Icon
              name="close_circle"
              color={getColor(banner.closeButtonColor ?? Color.graphicBase3)}
            />
          </IconButton>
        )}
      </View>
    ),
    [borderStyle, style, banner, onPressClose, loading, isSmall, onLayout],
  );

  if (!isVisible) {
    return <View style={styles.removeLeftMargin} />;
  }

  return (
    <ShadowCard
      testID={'ad-' + banner.id}
      onPress={onPressBanner}
      style={styles.removePaddingVertical}>
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
    minHeight: 111,
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
    maxWidth: '65%',
  },
  small: {
    height: 188,
  },
});
