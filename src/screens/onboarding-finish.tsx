import React, {useCallback, useEffect, useMemo} from 'react';

import {Finish} from '@app/components/finish';
import {hideModal} from '@app/helpers';
import {
  useApp,
  useTypedNavigation,
  useTypedRoute,
  useWallets,
} from '@app/hooks';
import {I18N} from '@app/i18n';
import {HapticEffects, vibrate} from '@app/services/haptic';

export const OnboardingFinishScreen = () => {
  const navigation = useTypedNavigation();
  const route = useTypedRoute<'createFinish'>();

  const app = useApp();
  const wallets = useWallets();
  const title = useMemo(
    () =>
      route.params.action === 'create'
        ? I18N.onboardingFinishCreate
        : I18N.onboardingFinishRecover,
    [route.params.action],
  );

  const onEnd = useCallback(() => {
    if (app.getUser().onboarded) {
      navigation.getParent()?.goBack();
    } else {
      app.getUser().onboarded = true;
      navigation.replace('home');
    }
    requestAnimationFrame(async () => {
      await wallets.checkForBackup(app.snoozeBackup);
    });
  }, [app, navigation, wallets]);

  useEffect(() => {
    hideModal();
    vibrate(HapticEffects.success);
  }, []);

  return <Finish title={title} onFinish={onEnd} testID="onboarding_finish" />;
};
