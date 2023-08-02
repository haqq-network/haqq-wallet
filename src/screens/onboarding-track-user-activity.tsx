import React, {useCallback} from 'react';

import {OnboardingTrackUserActivity} from '@app/components/onboarding-track-user-activity';
import {onBannerAnalyticsEnable} from '@app/event-actions/on-banner-analytics-enable';
import {onBannerAnalyticsSnooze} from '@app/event-actions/on-banner-analytics-snooze';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';

export const OnboardingTrackUserActivityScreen = () => {
  const navigation = useTypedNavigation();
  const route = useTypedRoute<'onboardingTrackUserActivity'>();

  const navigateToNextScreen = useCallback(() => {
    requestAnimationFrame(() => {
      const {nextScreen, ...params} = route.params;
      navigation.navigate(nextScreen ?? 'signupStoreWallet', params);
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
};
