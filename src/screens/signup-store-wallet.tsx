import React, {useEffect} from 'react';

import {View} from 'react-native';

import {app} from '@app/contexts';
import {captureException, showLoadinfWithText, showModal} from '@app/helpers';
import {useTypedNavigation, useTypedRoute, useWallets} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {generateMnemonic} from '@app/services/eth-utils';
import {
  ETH_HD_PATH,
  ETH_HD_SHORT_PATH,
  MAIN_ACCOUNT_NAME,
} from '@app/variables';

export const SignupStoreWalletScreen = () => {
  const navigation = useTypedNavigation();
  const {nextScreen} = useTypedRoute<'createStoreWallet'>().params;

  const wallets = useWallets();

  useEffect(() => {
    showLoadinfWithText(I18N.signupStoreWalletCreatingAccount);
  }, []);

  useEffect(() => {
    setTimeout(async () => {
      const accountNumber = getText(I18N.signupStoreWalletAccountNumber, {
        number: `${wallets.getSize() + 1}`,
      });
      try {
        const main = wallets.getMain();

        if (!main) {
          const mnemonic = await generateMnemonic();
          const wallet = await wallets.addWalletFromMnemonic(
            mnemonic,
            ETH_HD_PATH,
            wallets.getSize() === 0 ? MAIN_ACCOUNT_NAME : accountNumber,
          );
          if (wallet) {
            wallet.isMain = true;
          }
        } else {
          const password = await app.getPassword();
          const mnemonic = await main.getMnemonic(password);

          const last = wallets
            .getForRootAddress(main.rootAddress)
            .reduce((memo, wallet) => {
              const segments = wallet.path?.split('/') ?? ['0'];
              return Math.max(
                memo,
                parseInt(segments[segments.length - 1], 10),
              );
            }, 0);

          const wallet = await wallets.addWalletFromMnemonic(
            mnemonic,
            `${ETH_HD_SHORT_PATH}/${last + 1}`,
            accountNumber,
          );

          if (wallet) {
            wallet.mnemonicSaved = main.mnemonicSaved;
          }
        }

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
