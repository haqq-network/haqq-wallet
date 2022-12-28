import React from 'react';

import {StyleSheet, View} from 'react-native';

import {Color} from '@app/colors';
import {
  Button,
  ButtonSize,
  ButtonVariant,
  Icon,
  LottieWrap,
  Spacer,
  Text,
} from '@app/components/ui';
import {useThematicStyles} from '@app/hooks';
import {I18N} from '@app/i18n';
import {SHADOW_COLOR_1} from '@app/variables/common';

export type TrackActivityProps = {
  onClick: () => void;
};

export const TrackActivity = ({onClick}: TrackActivityProps) => {
  const styles = useThematicStyles(stylesObj);

  return (
    <View style={styles.sub}>
      <Spacer height={4} />
      <View style={styles.imageWrapper}>
        <LottieWrap
          style={styles.lottie}
          source={require('../../../../assets/animations/track-activity.json')}
          autoPlay
          loop={false}
        />
      </View>
      <Text t7 center i18n={I18N.trackActivityTitle} />
      <Spacer height={16} />
      <View style={styles.infoContainer}>
        <View style={styles.subInfoContainer}>
          <Icon color={Color.graphicGreen1} i24 name="up" />
          <View style={styles.infoDescription}>
            <Text
              t12
              color={Color.textBase1}
              style={styles.subtitle}
              i18n={I18N.trackActivityImprovement}
            />
            <Text
              t14
              color={Color.textBase2}
              i18n={I18N.trackActivityImprovementDescription}
            />
            <Spacer height={12} />
          </View>
        </View>
        <View style={styles.subInfoContainer}>
          <Icon color={Color.graphicGreen1} i24 name="lock" />
          <View style={styles.infoDescription}>
            <Text
              t12
              color={Color.textBase1}
              style={styles.subtitle}
              i18n={I18N.trackActivityPrivacy}
            />
            <Text
              t14
              color={Color.textBase2}
              i18n={I18N.trackActivityPrivacyDescription}
            />
          </View>
        </View>
      </View>
      <Spacer height={28} />
      <Button
        i18n={I18N.continue}
        variant={ButtonVariant.contained}
        size={ButtonSize.middle}
        onPress={onClick}
        style={styles.margin}
      />
      <Spacer height={8} />
    </View>
  );
};

const stylesObj = StyleSheet.create({
  sub: {
    marginHorizontal: 16,
    marginVertical: 35,
    backgroundColor: Color.bg1,
    flex: 0,
    paddingHorizontal: 24,
    paddingVertical: 32,
    borderRadius: 16,
    paddingBottom: 16,
  },
  infoContainer: {
    backgroundColor: Color.bg2,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  subInfoContainer: {
    flexDirection: 'row',
  },
  infoDescription: {
    flex: 1,
    marginLeft: 12,
  },
  subtitle: {
    marginBottom: 4,
  },
  margin: {marginBottom: 8},
  imageWrapper: {
    backgroundColor: Color.bg1,
    marginBottom: 20,
    borderColor: Color.graphicSecond1,
    borderWidth: 1,
    borderRadius: 12,
    shadowColor: SHADOW_COLOR_1,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowRadius: 8,
    shadowOpacity: 1,
    elevation: 13,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  lottie: {
    width: '100%',
  },
});
