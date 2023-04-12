import React from 'react';

import {StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
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
      <LinearGradient
        colors={[banner.backgroundColorFrom, banner.backgroundColorTo]}
        start={GRADIENT_START}
        end={GRADIENT_END}
        style={styles.inner}>
        <Text color={Color.textBase3} t10>
          {banner.title}
        </Text>
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
              style={styles.claimButton}
              title={button.title}
            />
          ))}
        </Inline>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  claimButton: {
    width: '100%',
  },
  container: {
    borderRadius: 16,
    maxHeight: 100,
  },
  inner: {
    padding: 16,
    borderRadius: 16,
  },
});
