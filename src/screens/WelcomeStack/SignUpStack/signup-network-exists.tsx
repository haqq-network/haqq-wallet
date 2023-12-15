import React, {memo, useCallback} from 'react';

import {ITEM_KEY} from '@haqq/provider-sss-react-native/dist/constants';
import {accountInfo} from '@haqq/provider-web3-utils';
import {Alert} from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';

import {SignupNetworkExists} from '@app/components/signup-network-exists';
import {app} from '@app/contexts';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {WelcomeStackRoutes} from '@app/screens/WelcomeStack';
import {SignInStackRoutes} from '@app/screens/WelcomeStack/SignInStack';
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

    const cloudShare = await cloud.getItem(
      `haqq_${account.address.toLowerCase()}`,
    );

    const localShare = await EncryptedStorage.getItem(
      `${ITEM_KEY}_${account.address.toLowerCase()}`,
    );

    if (!cloudShare && !localShare) {
      //@ts-ignore
      navigation.navigate(WelcomeStackRoutes.SignIn, {
        screen: SignInStackRoutes.SigninSharesNotFound,
      });
      return;
    }

    if (!cloudShare) {
      nextScreen = SignUpStackRoutes.SignUpPin;
    } else {
      nextScreen = app.onboarded
        ? SignUpStackRoutes.SignupStoreWallet
        : SignUpStackRoutes.OnboardingSetupPin;

      nextParams.sssCloudShare = cloudShare;
    }

    if (nextScreen === SignUpStackRoutes.SignupStoreWallet) {
      //@ts-ignore
      navigation.navigate(SignInStackRoutes.SigninStoreWallet, {
        type: 'sss',
        sssPrivateKey: nextParams.sssPrivateKey,
        token: nextParams.token,
        verifier: nextParams.verifier,
        sssCloudShare: cloudShare,
        sssLocalShare: null,
      });
      return;
    }

    //@ts-ignore
    navigation.navigate(nextScreen, {
      ...nextParams,
      type: 'sss',
      action: 'restore',
    });
  }, [navigation, route.params]);
  const onRewrite = useCallback(() => {
    Alert.alert(
      getText(I18N.signupNetworkExitsAlertTitle),
      getText(I18N.signupNetworkExitsAlertDescription),
      [
        {
          text: getText(I18N.erase),
          style: 'destructive',
          onPress: () => {
            const nextScreen = app.onboarded
              ? SignUpStackRoutes.SignupStoreWallet
              : SignUpStackRoutes.OnboardingSetupPin;

            const onNext = () => {
              // @ts-ignore
              navigation.navigate(nextScreen, {
                ...route.params,
                type: 'sss',
                action: 'replace',
              });
            };

            navigation.navigate(SignUpStackRoutes.SignupImportantInfo, {
              onNext,
            });
          },
        },
        {
          text: getText(I18N.cancel),
          style: 'cancel',
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
