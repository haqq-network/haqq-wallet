import React, {useCallback} from 'react';

import {accountInfo} from '@haqq/provider-web3-utils';
import {getMetadataValue} from '@haqq/shared-react-native';

import {SigninNetworks} from '@app/components/signin-networks';
import {useTypedNavigation, useUser} from '@app/hooks';
import {Cloud} from '@app/services/cloud';
import {
  MpcProviders,
  onLoginApple,
  onLoginCustom,
  onLoginGoogle,
} from '@app/services/provider-mpc';
import {RootStackParamList, WalletInitialData} from '@app/types';

export const SignInNetworksScreen = () => {
  const navigation = useTypedNavigation();
  const user = useUser();

  const onLogin = useCallback(
    async (provider: MpcProviders) => {
      let creds;
      switch (provider) {
        case MpcProviders.apple:
          creds = await onLoginApple();
          break;
        case MpcProviders.google:
          creds = await onLoginGoogle();
          break;
        case MpcProviders.custom:
          creds = await onLoginCustom();
          break;
      }
      console.log('creds', creds);

      if (creds) {
        let nextScreen: string = '';
        let nextParams: WalletInitialData = {
          type: 'mpc',
          mpcPrivateKey: creds.privateKey,
          token: creds.token,
          verifier: creds.verifier,
          mpcCloudShare: null,
        };

        const walletInfo = await getMetadataValue(
          'http://localhost:8069',
          creds.privateKey,
          'walletInfo',
        );

        if (!walletInfo) {
          throw new Error('Wallet info not found');
        }

        const supported = await Cloud.isEnabled();

        if (!supported) {
          nextScreen = 'signinNotExists';
        } else {
          const cloud = new Cloud();

          const account = await accountInfo(creds.privateKey);

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
        }
        navigation.navigate(
          // @ts-ignore
          nextScreen as keyof RootStackParamList,
          nextParams,
        );
      }
    },
    [navigation, user.onboarded],
  );

  const onSkip = useCallback(() => {
    navigation.navigate('signinAgreement');
  }, [navigation]);

  return <SigninNetworks onLogin={onLogin} onSkip={onSkip} />;
};
