import React, {memo, useCallback} from 'react';

import {OnboardingTrackUserActivity} from '@app/components/onboarding-track-user-activity';
import {onBannerAnalyticsEnable} from '@app/event-actions/on-banner-analytics-enable';
import {onBannerAnalyticsSnooze} from '@app/event-actions/on-banner-analytics-snooze';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {
  OnboardingStackParamList,
  OnboardingStackRoutes,
} from '@app/screens/WelcomeStack/OnboardingStack';

export const OnboardingTrackUserActivityScreen = memo(() => {
  const navigation = useTypedNavigation<OnboardingStackParamList>();
  const route = useTypedRoute<
    OnboardingStackParamList,
    OnboardingStackRoutes.OnboardingTrackUserActivity
  >();

  const navigateToNextScreen = useCallback(() => {
    requestAnimationFrame(() => {
      const {nextScreen, ...params} = route.params;
      // TODO: Найти типы
      //@ts-ignore
      navigation.navigate(nextScreen, params);
    });
  }, [navigation, route.params]);

  const onClickSkip = useCallback(async () => {
    await onBannerAnalyticsSnooze('trackActivity');
    navigateToNextScreen();
  }, [navigateToNextScreen]);

  const onClickEnable = useCallback(async () => {
    try {
      await onBannerAnalyticsEnable('trackActivity');
      navigateToNextScreen();
    } catch (e) {
      Logger.captureException(e, 'onClickEnableUserTrackingActivity');
    }
  }, [navigateToNextScreen]);

  return (
    <OnboardingTrackUserActivity
      onClickSkip={onClickSkip}
      onClickEnable={onClickEnable}
    />
  );
});
