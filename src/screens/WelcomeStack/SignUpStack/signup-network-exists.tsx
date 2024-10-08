import React, {memo, useCallback} from 'react';

import {accountInfo} from '@haqq/provider-web3-utils';
import {constants} from '@haqq/rn-wallet-providers';
import {Alert} from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';

import {SignupNetworkExists} from '@app/components/signup-network-exists';
import {app} from '@app/contexts';
import {getProviderStorage} from '@app/helpers/get-provider-storage';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {
  SignInStackRoutes,
  SignUpStackParamList,
  SignUpStackRoutes,
  WelcomeStackRoutes,
} from '@app/route-types';
import {Cloud} from '@app/services/cloud';
import {GoogleDrive} from '@app/services/google-drive';
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

    //@ts-ignore
    const provider = nextParams.provider === 'apple' ? Cloud : GoogleDrive;
    //@ts-ignore
    const cloud = await getProviderStorage('', nextParams.provider);
    const supported = await provider.isEnabled();

    if (!supported) {
      nextScreen = SignUpStackRoutes.SignUpPin;
    }

    const account = await accountInfo(nextParams.sssPrivateKey);

    const cloudShare = await cloud.getItem(
      `haqq_${account.address.toLowerCase()}`,
    );

    const localShare = await EncryptedStorage.getItem(
      `${
        constants.ITEM_KEYS[constants.WalletType.sss]
      }_${account.address.toLowerCase()}`,
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
          onPress: async () => {
            //@ts-ignore
            const account = await accountInfo(route.params.sssPrivateKey);
            const cloud = await getProviderStorage('', route.params.provider);
            await cloud.removeItem(`haqq_${account?.address?.toLowerCase()}`);

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
