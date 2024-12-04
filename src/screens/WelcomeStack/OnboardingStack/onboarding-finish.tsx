import React, {useCallback, useEffect, useMemo} from 'react';

import {observer} from 'mobx-react';

import {Finish} from '@app/components/finish';
import {app} from '@app/contexts';
import {Events} from '@app/events';
import {hideModal} from '@app/helpers';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {I18N} from '@app/i18n';
import {AppStore} from '@app/models/app';
import {
  HomeStackRoutes,
  OnboardingStackParamList,
  OnboardingStackRoutes,
} from '@app/route-types';
import {EventTracker} from '@app/services/event-tracker';
import {HapticEffects, vibrate} from '@app/services/haptic';
import {WalletConnect} from '@app/services/wallet-connect';
import {ModalType} from '@app/types';

export const OnboardingFinishScreen = observer(() => {
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
      if (AppStore.isOnboarded) {
        //@ts-ignore
        navigation.navigate(HomeStackRoutes.Home);
        return;
      }

      WalletConnect.instance.init();
      AppStore.isOnboarded = true;

      app.emit(Events.onBlockRequestCheck);

      requestAnimationFrame(() => {
        app.emit(Events.onAppStarted);
      });
    } else {
      navigation.getParent()?.goBack();
    }
  }, [route, navigation, AppStore.isOnboarded]);

  useEffect(() => {
    EventTracker.instance.trackEvent(route.params.event);
    hideModal(ModalType.loading);
    vibrate(HapticEffects.success);
  }, [route.params.event]);

  return <Finish title={title} onFinish={onEnd} testID="onboarding_finish" />;
});
