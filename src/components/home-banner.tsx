import React, {useCallback, useMemo, useState} from 'react';

import {
  Image,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import {Color, getColor} from '@app/colors';
import {Banner, BannerButton} from '@app/models/banner';
import {sleep} from '@app/utils';
import {GRADIENT_END, GRADIENT_START} from '@app/variables/common';

import {
  Button,
  ButtonSize,
  ButtonVariant,
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
    event: string,
    params?: object,
    button?: BannerButton,
  ) => Promise<void>;
}

export const HomeBanner = ({banner, style, onPress}: HomeBannerProps) => {
  const [loading, setLoading] = useState(false);
  const [isVisible, setVisible] = useState(true);

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
            color={banner.descriptionColor ?? Color.textBase3}
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
    [borderStyle, style, banner, onPressClose, loading, onPressBanner],
  );

  if (!isVisible) {
    return null;
  }

  if (!banner.buttons.length && banner.defaultEvent) {
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
    position: 'relative',
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
