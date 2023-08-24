import React, {useCallback, useMemo, useState} from 'react';

import {Image, StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
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
import {IBannerWidget} from '@app/types';
import {openWeb3Browser} from '@app/utils';
import {GRADIENT_END, GRADIENT_START} from '@app/variables/common';

export interface HomeBannerProps {
  banner: IBannerWidget;
  style?: StyleProp<ViewStyle>;
}

export function BannerWidget({banner, style}: HomeBannerProps) {
  const [loading, setLoading] = useState(false);
  const [isVisible, setVisible] = useState(true);

  const onPressClose = useCallback(async () => {
    setVisible(false);
  }, []);

  const onPressBanner = useCallback(async () => {
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

  const elem = useMemo(
    () => (
      <View style={[styles.container, borderStyle, style]}>
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
        <Text color={banner.titleColor ?? Color.textBase3} t10>
          {banner.title}
        </Text>
        {banner.description && (
          <Text
            style={styles.description}
            color={banner.descriptionColor ?? Color.textBase2}
            t14>
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
    [borderStyle, style, banner, onPressClose, loading],
  );

  if (!isVisible) {
    return <View style={styles.removeLeftMargin} />;
  }

  return (
    <ShadowCard onPress={onPressBanner} style={styles.removePaddingVertical}>
      {elem}
    </ShadowCard>
  );
}

const styles = StyleSheet.create({
  removePaddingVertical: {paddingVertical: 0},
  removeLeftMargin: {marginLeft: -20},
  container: {
    borderRadius: 16,
    padding: 16,
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
    marginTop: 8,
  },
});
