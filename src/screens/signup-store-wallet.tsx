import React, {useCallback, useEffect} from 'react';

import {ProviderSSSReactNative} from '@haqq/provider-sss-react-native';
import {View} from 'react-native';

import {hideModal, showModal} from '@app/helpers';
import {getProviderForNewWallet} from '@app/helpers/get-provider-for-new-wallet';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {Wallet} from '@app/models/wallet';
import {ModalType} from '@app/types';
import {WalletType} from '@app/types';
import {ETH_HD_SHORT_PATH, MAIN_ACCOUNT_NAME} from '@app/variables/common';

export const SignUpStoreWalletScreen = () => {
  const navigation = useTypedNavigation();
  const route = useTypedRoute<'createStoreWallet'>();

  const goBack = useCallback(() => {
    hideModal(ModalType.loading);
    navigation.replace('signup', {next: ''});
  }, [navigation]);

  useEffect(() => {
    showModal(ModalType.loading, {
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
          Wallet.getSize() === 0
            ? MAIN_ACCOUNT_NAME
            : getText(I18N.signupStoreWalletAccountNumber, {
                number: `${Wallet.getSize() + 1}`,
              });
        const {address} = await provider.getAccountInfo(hdPath);
        const type =
          provider instanceof ProviderSSSReactNative
            ? WalletType.sss
            : WalletType.mnemonic;
        await Wallet.create(name, {
          address,
          accountId: provider.getIdentifier(),
          path: hdPath,
          type,
        });

        navigation.navigate(route.params.nextScreen ?? 'onboardingFinish');
      } catch (error) {
        switch (error) {
          case 'wallet_already_exists':
            showModal(ModalType.errorAccountAdded);
            goBack();
            break;
          default:
            if (error instanceof Error) {
              showModal(ModalType.errorCreateAccount);
              goBack();
              Logger.captureException(error, 'createStoreWallet');
            }
        }
      }
    }, 350);
  }, [goBack, navigation, route.params]);

  return <View />;
};
