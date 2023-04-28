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
        console.log('createStoreWallet 1');
        const provider = await getProviderForNewWallet(route.params);
        console.log('createStoreWallet 2', provider.getIdentifier());
        const accountWallets = Wallet.getForAccount(provider.getIdentifier());
        console.log('createStoreWallet 3', accountWallets.length);
        const nextHdPathIndex = accountWallets.reduce((memo, wallet) => {
          const segments = wallet.path?.split('/') ?? ['0'];
          return Math.max(
            memo,
            parseInt(segments[segments.length - 1], 10) + 1,
          );
        }, 0);
        console.log('createStoreWallet 4', nextHdPathIndex);
        const hdPath = `${ETH_HD_SHORT_PATH}/${nextHdPathIndex}`;
        console.log('createStoreWallet 5', hdPath);
        const name =
          wallets.getSize() === 0
            ? MAIN_ACCOUNT_NAME
            : getText(I18N.signupStoreWalletAccountNumber, {
                number: `${wallets.getSize() + 1}`,
              });
        console.log('createStoreWallet 6', name);
        const {address} = await provider.getAccountInfo(hdPath);
        console.log('createStoreWallet 7', address);
        const type =
          provider instanceof ProviderMpcReactNative
            ? WalletType.mpc
            : WalletType.mnemonic;
        console.log('createStoreWallet 8', type);
        await wallets.addWallet(
          {
            address,
            accountId: provider.getIdentifier(),
            path: hdPath,
            type,
          },
          name,
        );
        console.log('createStoreWallet 9');
        navigation.navigate(route.params.nextScreen ?? 'onboardingFinish');
      } catch (error) {
        switch (error) {
          case 'wallet_already_exists':
            showModal('error-account-added');
            goBack();
            break;
          default:
            if (error instanceof Error) {
              console.error('SignUpStoreWalletScreen error', error);
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
