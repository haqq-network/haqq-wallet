import React from 'react';

import {View} from 'react-native';

import {Color} from '@app/colors';
import {
  Button,
  ButtonVariant,
  Icon,
  IconsName,
  LottieWrap,
  PopupContainer,
  Spacer,
  Text,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';

interface OnboardingBiometryProps {
  onClickSkip: () => void;
  onClickEnable: () => void;
}

export const OnboardingTrackUserActivity = ({
  onClickSkip,
  onClickEnable,
}: OnboardingBiometryProps) => {
  return (
    <PopupContainer
      style={style.container}
      testID="onboarding_track_user_activity">
      <Spacer style={style.animation}>
        <LottieWrap
          loop
          autoPlay
          source={require('@assets/animations/track-activity.json')}
        />
      </Spacer>
      <Text center t4 i18n={I18N.onboardingTrackingUserActivityTitle} />
      <Spacer height={12} />
      <View style={style.infoCardContainer}>
        <View style={style.row}>
          <Icon color={Color.graphicGreen1} name={IconsName.up} />
          <Spacer width={12} />
          <View style={style.flexOne}>
            <Text t12 i18n={I18N.onboardingTrackingUserActivityHint1Title} />
            <Spacer width={4} />
            <Text
              t14
              color={Color.textBase2}
              i18n={I18N.onboardingTrackingUserActivityHint1Description}
            />
          </View>
        </View>
        <Spacer height={12} />
        <View style={style.row}>
          <Icon color={Color.graphicGreen1} name={IconsName.lock} />
          <Spacer width={12} />
          <View style={style.flexOne}>
            <Text t12 i18n={I18N.onboardingTrackingUserActivityHint2Title} />
            <Spacer width={4} />
            <Text
              t14
              color={Color.textBase2}
              i18n={I18N.onboardingTrackingUserActivityHint2Description}
            />
          </View>
        </View>
      </View>
      <Spacer />
      <Button
        style={[style.margin, style.width100]}
        variant={ButtonVariant.contained}
        i18n={I18N.onboardingTrackingUserActivityContinue}
        testID="onboarding_tracking_enable"
        onPress={onClickEnable}
      />
      <Button
        style={[style.margin, style.width100]}
        i18n={I18N.onboardingTrackingUserActivityNotNow}
        testID="onboarding_tracking_skip"
        onPress={onClickSkip}
      />
    </PopupContainer>
  );
};

const style = createTheme({
  container: {
    marginHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  margin: {marginBottom: 16},
  animation: {
    width: 295,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    width: '100%',
  },
  flexOne: {
    flex: 1,
  },
  width100: {
    width: '100%',
  },
  infoCardContainer: {
    backgroundColor: Color.bg2,
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
  },
});
