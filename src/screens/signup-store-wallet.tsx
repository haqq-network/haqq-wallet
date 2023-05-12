import React, {useCallback, useEffect} from 'react';

import {ProviderMpcReactNative} from '@haqq/provider-mpc-react-native';
import {View} from 'react-native';

import {captureException, showModal} from '@app/helpers';
import {getProviderForNewWallet} from '@app/helpers/get-provider-for-new-wallet';
import {useTypedNavigation, useTypedRoute, useWallets} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {Wallet} from '@app/models/wallet';
import {WalletType} from '@app/types';
import {ETH_HD_SHORT_PATH, MAIN_ACCOUNT_NAME} from '@app/variables/common';

export const SignUpStoreWalletScreen = () => {
  const navigation = useTypedNavigation();
  const route = useTypedRoute<'createStoreWallet'>();

  const wallets = useWallets();
  const goBack = useCallback(() => {
    navigation.reset({
      routes: [{name: 'welcome'}, {name: 'signup', params: {next: 'restore'}}],
    });
  }, [navigation]);

  useEffect(() => {
    showModal('loading', {
      text: getText(I18N.signupStoreWalletCreatingAccount),
    });
  }, []);

  useEffect(() => {
    setTimeout(async () => {
      try {
        const provider = await getProviderForNewWallet(route.params);
        const accountWallets = Wallet.getForAccount(provider.getIdentifier());
        const nextHdPathIndex = accountWallets.reduce((memo, wallet) => {
          const segments = wallet.path?.split('/') ?? ['0'];
          return Math.max(
            memo,
            parseInt(segments[segments.length - 1], 10) + 1,
          );
        }, 0);
        const hdPath = `${ETH_HD_SHORT_PATH}/${nextHdPathIndex}`;
        const name =
          wallets.getSize() === 0
            ? MAIN_ACCOUNT_NAME
            : getText(I18N.signupStoreWalletAccountNumber, {
                number: `${wallets.getSize() + 1}`,
              });
        const {address} = await provider.getAccountInfo(hdPath);
        const type =
          provider instanceof ProviderMpcReactNative
            ? WalletType.mpc
            : WalletType.mnemonic;
        await wallets.addWallet(
          {
            address,
            accountId: provider.getIdentifier(),
            path: hdPath,
            type,
          },
          name,
        );
        navigation.navigate(route.params.nextScreen ?? 'onboardingFinish');
      } catch (error) {
        switch (error) {
          case 'wallet_already_exists':
            showModal('error-account-added');
            goBack();
            break;
          default:
            if (error instanceof Error) {
              showModal('error-create-account');
              goBack();
              captureException(error, 'createStoreWallet');
            }
        }
      }
    }, 350);
  }, [goBack, navigation, route.params, wallets]);

  return <View />;
};
