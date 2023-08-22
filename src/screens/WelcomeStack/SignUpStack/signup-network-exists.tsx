import React, {memo, useCallback} from 'react';

import {accountInfo} from '@haqq/provider-web3-utils';
import {Alert} from 'react-native';

import {SignupNetworkExists} from '@app/components/signup-network-exists';
import {app} from '@app/contexts';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {
  SignUpStackParamList,
  SignUpStackRoutes,
} from '@app/screens/WelcomeStack/SignUpStack';
import {Cloud} from '@app/services/cloud';
import {WalletInitialData} from '@app/types';

export const SignupNetworkExistsScreen = memo(() => {
  const navigation = useTypedNavigation<SignUpStackParamList>();
  const route = useTypedRoute<
    SignUpStackParamList,
    SignUpStackRoutes.SignUpNetworkExists
  >();
  const onRestore = useCallback(async () => {
    let nextScreen: string = '';
    let nextParams: WalletInitialData = route.params;

    if (nextParams.type !== 'sss' || !nextParams.sssPrivateKey) {
      return;
    }

    const supported = await Cloud.isEnabled();

    if (!supported) {
      nextScreen = SignUpStackRoutes.SignUpPin;
    }

    const cloud = new Cloud();

    const account = await accountInfo(nextParams.sssPrivateKey);

    const share = await cloud.getItem(`haqq_${account.address.toLowerCase()}`);

    if (!share) {
      nextScreen = SignUpStackRoutes.SignUpPin;
    } else {
      nextScreen = app.onboarded
        ? SignUpStackRoutes.SignUpPin
        : SignUpStackRoutes.OnboardingSetupPin;

      nextParams.sssCloudShare = share;
    }

    //@ts-ignore
    navigation.navigate(nextScreen, nextParams);
  }, [navigation, route.params]);
  const onRewrite = useCallback(() => {
    Alert.alert(
      getText(I18N.signupNetworkExitsAlertTitle),
      getText(I18N.signupNetworkExitsAlertDescription),
      [
        {
          text: getText(I18N.cancel),
          style: 'cancel',
        },
        {
          text: getText(I18N.accept),
          style: 'destructive',
          onPress: () => {
            const nextScreen = app.onboarded
              ? SignUpStackRoutes.SignUpPin
              : SignUpStackRoutes.OnboardingSetupPin;

            // @ts-ignore
            navigation.navigate(nextScreen, {
              ...route.params,
              sssPrivateKey: null,
            });
          },
        },
      ],
    );
  }, [navigation, route.params]);

  return (
    <SignupNetworkExists
      provider={route.params.provider}
      email={route.params.email}
      onRestore={onRestore}
      onRewrite={onRewrite}
    />
  );
});
