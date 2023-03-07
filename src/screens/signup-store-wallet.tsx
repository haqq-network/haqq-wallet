import React, {useEffect} from 'react';

import {View} from 'react-native';

import {captureException, showModal} from '@app/helpers';
import {getProviderForNewWallet} from '@app/helpers/get-provider-for-new-wallet';
import {useTypedNavigation, useTypedRoute, useWallets} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {Wallet} from '@app/models/wallet';
import {ProviderMpcReactNative} from '@app/services/provider-mpc';
import {WalletType} from '@app/types';
import {ETH_HD_SHORT_PATH, MAIN_ACCOUNT_NAME} from '@app/variables/common';

export const SignUpStoreWalletScreen = () => {
  const navigation = useTypedNavigation();
  const {nextScreen} = useTypedRoute<'createStoreWallet'>().params;

  const wallets = useWallets();

  useEffect(() => {
    showModal('loading', {
      text: getText(I18N.signupStoreWalletCreatingAccount),
    });
  }, []);

  useEffect(() => {
    setTimeout(async () => {
      try {
        const provider = await getProviderForNewWallet();

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

        navigation.navigate(nextScreen ?? 'onboardingFinish');
      } catch (error) {
        switch (error) {
          case 'wallet_already_exists':
            showModal('error-account-added');
            navigation.getParent()?.goBack();
            break;
          default:
            if (error instanceof Error) {
              showModal('error-create-account');
              captureException(error, 'createStoreWallet');
              navigation.getParent()?.goBack();
            }
        }
      }
    }, 350);
  }, [navigation, nextScreen, wallets]);

  return <View />;
};
