import React, {useCallback, useEffect, useMemo} from 'react';

import {Finish} from '@app/components/finish';
import {app} from '@app/contexts';
import {onTrackEvent} from '@app/event-actions/on-track-event';
import {Events} from '@app/events';
import {hideModal} from '@app/helpers';
import {useTypedNavigation, useTypedRoute, useUser} from '@app/hooks';
import {I18N} from '@app/i18n';
import {HapticEffects, vibrate} from '@app/services/haptic';
import {WalletConnect} from '@app/services/wallet-connect';

export const OnboardingFinishScreen = () => {
  const navigation = useTypedNavigation();
  const route = useTypedRoute<'createFinish'>();
  const user = useUser();

  const title: I18N = useMemo(
    () =>
      route.params.action === 'create'
        ? I18N.onboardingFinishCreate
        : I18N.onboardingFinishRecover,
    [route.params.action],
  );

  const onEnd = useCallback(() => {
    if (user.onboarded) {
      navigation.getParent()?.goBack();
    } else {
      WalletConnect.instance.init();
      navigation.replace('home');
    }
    requestAnimationFrame(() => {
      app.emit(Events.onAppStarted);
    });
  }, [user, navigation]);

  useEffect(() => {
    if (!user.onboarded) {
      user.onboarded = true;
    }

    onTrackEvent(route.params.event);
    hideModal('loading');
    vibrate(HapticEffects.success);
  }, [route.params.event, user]);

  return <Finish title={title} onFinish={onEnd} testID="onboarding_finish" />;
};
