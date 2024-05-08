import React from 'react';

import {View} from 'react-native';

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
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
import {SHADOW_L} from '@app/variables/shadows';

export type TrackActivityProps = {
  onClickContinue: () => void;
  onClickNotNow: () => void;
};

export const TrackActivity = ({
  onClickContinue,
  onClickNotNow,
}: TrackActivityProps) => {
  return (
    <View style={styles.sub}>
      <Spacer height={4} />
      <View style={styles.imageWrapper}>
        <LottieWrap
          style={styles.lottie}
          source={require('@assets/animations/track-activity.json')}
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
        i18n={I18N.trackActivityContinue}
        variant={ButtonVariant.contained}
        size={ButtonSize.middle}
        onPress={onClickContinue}
      />
      <Spacer height={16} />
      <Button
        i18n={I18N.trackActivityNotNow}
        variant={ButtonVariant.third}
        size={ButtonSize.middle}
        onPress={onClickNotNow}
      />
      <Spacer height={8} />
    </View>
  );
};

const styles = createTheme({
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
  imageWrapper: {
    marginBottom: 20,
    borderColor: Color.graphicSecond1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    ...SHADOW_L,
  },
  lottie: {
    width: 295,
    height: 64,
  },
});
