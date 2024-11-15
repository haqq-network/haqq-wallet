import React, {useCallback} from 'react';

import {observer} from 'mobx-react';

import {CreateAgreement} from '@app/components/create-agreement';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {AppStore} from '@app/models/app';
import {
  HomeStackParamList,
  HomeStackRoutes,
  SignUpStackParamList,
  SignUpStackRoutes,
  WelcomeStackRoutes,
} from '@app/route-types';

export const SignUpAgreementScreen = observer(() => {
  const navigation = useTypedNavigation<SignUpStackParamList>();
  const params = useTypedRoute<
    SignUpStackParamList & HomeStackParamList,
    SignUpStackRoutes.SignUpAgreement
  >().params;
  const onPressRegularWallet = useCallback(() => {
    //@ts-ignore
    return navigation.navigate(params.nextScreen, {
      //@ts-ignore
      type: params.type || 'empty',
      //@ts-ignore
      provider: params.provider || undefined,
    });
  }, [navigation, params.nextScreen]);

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
