import React from 'react';

import {PATTERNS_SOURCE} from '@env';
import {
  ImageBackground,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

import {Color} from '@app/colors';
import {I18N} from '@app/i18n';
import {REWARD_BANNER_DEFAULT_STYLE} from '@app/variables/common';

import {Button, ButtonSize, ButtonVariant, Spacer, Text} from './ui';

export interface RewardBannerProps {
  title: I18N;
  style?: StyleProp<ViewStyle>;
  pattern?: string;
  onClaimPress(): void;
}

export const RewardBanner = ({
  title,
  style,
  pattern = REWARD_BANNER_DEFAULT_STYLE,
  onClaimPress,
}: RewardBannerProps) => {
  return (
    <View style={[styles.container, style]}>
      <ImageBackground
        resizeMode="cover"
        imageStyle={styles.image}
        source={{uri: `${PATTERNS_SOURCE}${pattern}.png`}}>
        <View style={styles.content}>
          <Text color={Color.textBase3} t10 i18n={title} />
          <Spacer height={15} />
          <Button
            onPress={onClaimPress}
            i18n={I18N.rewardBannerClaim}
            color={Color.bg2}
            textColor={Color.textGreen1}
            variant={ButtonVariant.contained}
            size={ButtonSize.small}
            style={styles.claimButton}
          />
        </View>
      </ImageBackground>
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
  image: {
    maxHeight: 100,
    borderRadius: 16,
    alignSelf: 'center',
  },
  content: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    alignSelf: 'center',
    width: '100%',
    height: '100%',
    borderRadius: 16,
    paddingHorizontal: 20,
  },
});
