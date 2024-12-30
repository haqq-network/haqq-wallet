import React, {useCallback} from 'react';

import {observer} from 'mobx-react';

import {CreateAgreement} from '@app/components/create-agreement';
import {Feature, isFeatureEnabled} from '@app/helpers/is-feature-enabled';
import {useTypedNavigation} from '@app/hooks';
import {AppStore} from '@app/models/app';
import {
  HomeStackRoutes,
  SignUpStackParamList,
  SignUpStackRoutes,
  WelcomeStackRoutes,
} from '@app/route-types';

export const SignUpAgreementScreen = observer(() => {
  const navigation = useTypedNavigation<SignUpStackParamList>();

  const onPressRegularWallet = useCallback(() => {
    const nextScreen = isFeatureEnabled(Feature.sss)
      ? SignUpStackRoutes.SignUpNetworks
      : SignUpStackRoutes.OnboardingSetupPin;

    return navigation.navigate(nextScreen, {
      //@ts-ignore
      type: params.type || 'empty',
      //@ts-ignore
      provider: params.provider || undefined,
    });
  }, [navigation]);

  const onPressHardwareWallet = () => {
    navigation.replace(
      //@ts-ignore
      AppStore.isOnboarded ? HomeStackRoutes.Device : WelcomeStackRoutes.Device,
    );
  };

  return (
    <CreateAgreement
      testID="signup_agreement"
      onPressHardwareWallet={onPressHardwareWallet}
      onPressRegularWallet={onPressRegularWallet}
    />
  );
});
