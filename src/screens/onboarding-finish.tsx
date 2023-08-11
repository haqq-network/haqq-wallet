import React, {memo, useCallback, useEffect, useMemo} from 'react';

import {Finish} from '@app/components/finish';
import {app} from '@app/contexts';
import {onTrackEvent} from '@app/event-actions/on-track-event';
import {Events} from '@app/events';
import {hideModal} from '@app/helpers';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {I18N} from '@app/i18n';
import {
  OnboardingStackParamList,
  OnboardingStackRoutes,
} from '@app/screens/WelcomeStack/OnboardingStack';
import {HapticEffects, vibrate} from '@app/services/haptic';
import {WalletConnect} from '@app/services/wallet-connect';

export const OnboardingFinishScreen = memo(() => {
  const navigation = useTypedNavigation<OnboardingStackParamList>();
  const route = useTypedRoute<
    OnboardingStackParamList,
    OnboardingStackRoutes.OnboardingFinish
  >();

  const title: I18N = useMemo(
    () =>
      route.params.action === 'create'
        ? I18N.onboardingFinishCreate
        : I18N.onboardingFinishRecover,
    [route.params.action],
  );

  const onEnd = useCallback(() => {
    if (route.params.onboarding) {
      WalletConnect.instance.init();
      app.onboarded = true;

      requestAnimationFrame(() => {
        app.emit(Events.onAppStarted);
      });
    } else {
      navigation.getParent()?.goBack();
    }
  }, [route, navigation]);

  useEffect(() => {
    onTrackEvent(route.params.event);
    hideModal('loading');
    vibrate(HapticEffects.success);
  }, [route.params.event]);

  return <Finish title={title} onFinish={onEnd} testID="onboarding_finish" />;
});
