import React, {useCallback} from 'react';

import {accountInfo} from '@haqq/provider-web3-utils';
import {Alert} from 'react-native';

import {SignupNetworkExists} from '@app/components/signup-network-exists';
import {useTypedNavigation, useTypedRoute, useUser} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {Cloud} from '@app/services/cloud';
import {RootStackParamList, WalletInitialData} from '@app/types';

export const SignupNetworkExistsScreen = () => {
  const user = useUser();
  const navigation = useTypedNavigation();
  const route = useTypedRoute<'signupNetworkExists'>();
  const onRestore = useCallback(async () => {
    let nextScreen: string = '';
    let nextParams: WalletInitialData = route.params;

    if (nextParams.type !== 'mpc' || !nextParams.mpcPrivateKey) {
      return;
    }

    const supported = await Cloud.isEnabled();

    if (!supported) {
      nextScreen = 'signupPin';
    }

    const cloud = new Cloud();

    const account = await accountInfo(nextParams.mpcPrivateKey);

    const share = await cloud.getItem(`haqq_${account.address.toLowerCase()}`);

    if (!share) {
      nextScreen = 'signupPin';
    } else {
      nextScreen = user.onboarded ? 'signupStoreWallet' : 'onboardingSetupPin';

      nextParams.mpcCloudShare = share;
    }

    navigation.navigate(
      // @ts-ignore
      nextScreen as keyof RootStackParamList,
      nextParams,
    );
  }, [navigation, route.params, user.onboarded]);
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
            const nextScreen = user.onboarded
              ? 'signupStoreWallet'
              : 'onboardingSetupPin';

            // @ts-ignore
            navigation.navigate(nextScreen, {
              ...route.params,
              mpcPrivateKey: null,
            });
          },
        },
      ],
    );
  }, [navigation, route.params, user.onboarded]);

  return (
    <SignupNetworkExists
      provider={route.params.provider}
      email={route.params.email}
      onRestore={onRestore}
      onRewrite={onRewrite}
    />
  );
};
