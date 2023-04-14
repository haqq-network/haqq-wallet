import React from 'react';

import {Image, StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import {Color} from '@app/colors';
import {Banner, BannerButton} from '@app/models/banner';
import {GRADIENT_END, GRADIENT_START} from '@app/variables/common';

import {Button, ButtonSize, ButtonVariant, Inline, Spacer, Text} from './ui';

export interface RewardBannerProps {
  banner: Banner;
  style?: StyleProp<ViewStyle>;
  onPress: (id: string, action: BannerButton) => Promise<void>;
}

export const HomeBanner = ({banner, style, onPress}: RewardBannerProps) => {
  return (
    <View style={[styles.container, style]}>
      {banner.backgroundImage ? (
        <Image
          resizeMode="stretch"
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
        <Text color={banner.descriptionColor ?? Color.textBase3} t14>
          {banner.description}
        </Text>
      )}
      <Spacer height={12} />
      <Inline gap={20}>
        {banner.buttons.map(button => (
          <Button
            key={banner.id}
            onPress={() => onPress(banner.id, button)}
            color={button.backgroundColor}
            textColor={button.color}
            variant={ButtonVariant.contained}
            size={ButtonSize.small}
            title={button.title}
          />
        ))}
      </Inline>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
  },
  inner: {
    borderRadius: 16,
    ...StyleSheet.absoluteFillObject,
  },
});
