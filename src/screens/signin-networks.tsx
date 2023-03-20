import React, {useCallback} from 'react';

import {initializeTKey} from '@haqq/provider-mpc-react-native';
import {accountInfo} from '@haqq/provider-web3-utils';

import {SigninNetworks} from '@app/components/signin-networks';
import {useTypedNavigation, useUser} from '@app/hooks';
import {Cloud} from '@app/services/cloud';
import {
  MpcProviders,
  onLoginApple,
  onLoginCustom,
  onLoginGoogle,
  serviceProviderOptions,
  storageLayerOptions,
} from '@app/services/provider-mpc';
import {RootStackParamList, WalletInitialData} from '@app/types';

export const SignInNetworksScreen = () => {
  const navigation = useTypedNavigation();
  const user = useUser();

  const onLogin = useCallback(
    async (provider: MpcProviders) => {
      let privateKey: string | null = null;
      switch (provider) {
        case MpcProviders.apple:
          privateKey = await onLoginApple();
          break;
        case MpcProviders.google:
          privateKey = await onLoginGoogle();
          break;
        case MpcProviders.custom:
          privateKey = await onLoginCustom();
          break;
      }
      if (privateKey) {
        let nextScreen: string = '';
        let nextParams: WalletInitialData = {
          type: 'mpc',
          mpcPrivateKey: privateKey,
          mpcSecurityQuestion: null,
          mpcCloudShare: null,
        };

        try {
          const {securityQuestionsModule} = await initializeTKey(
            privateKey,
            serviceProviderOptions as any,
            storageLayerOptions,
          );

          securityQuestionsModule.getSecurityQuestions();

          const supported = await Cloud.isEnabled();

          if (!supported) {
            nextScreen = 'signinPin';
          }

          const cloud = new Cloud();

          const account = await accountInfo(privateKey);

          const share = await cloud.getItem(
            `haqq_${account.address.toLowerCase()}`,
          );

          if (!share) {
            nextScreen = 'signinNotRecovery';
          } else {
            nextScreen = user.onboarded
              ? 'signinStoreWallet'
              : 'onboardingSetupPin';

            nextParams.mpcCloudShare = share;
          }
        } catch (e) {
          nextScreen = 'signinNotExists';
          // @ts-ignore
          nextParams.provider = provider;
        } finally {
          // nextScreen = 'signinNotRecovery';
          navigation.navigate(
            // @ts-ignore
            nextScreen as keyof RootStackParamList,
            nextParams,
          );
        }
      }
    },
    [navigation, user.onboarded],
  );

  const onSkip = useCallback(() => {
    navigation.navigate('signinAgreement');
  }, [navigation]);

  return <SigninNetworks onLogin={onLogin} onSkip={onSkip} />;
};
