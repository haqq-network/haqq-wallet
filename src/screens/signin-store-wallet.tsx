import React, {useEffect} from 'react';

import {View} from 'react-native';

import {captureException, showLoadingWithText, showModal} from '@app/helpers';
import {useTypedNavigation, useTypedRoute, useWallets} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {EthNetwork} from '@app/services';
import {restoreFromMnemonic} from '@app/services/eth-utils';
import {WalletType} from '@app/types';
import {ETH_HD_SHORT_PATH, MAIN_ACCOUNT_NAME} from '@app/variables/common';

export const SignInStoreWalletScreen = () => {
  const navigation = useTypedNavigation();
  const {nextScreen, mnemonic, privateKey} =
    useTypedRoute<'restoreStore'>().params;
  const wallets = useWallets();

  useEffect(() => {
    showLoadingWithText(I18N.signinStoreWalletText);
  }, []);

  useEffect(() => {
    const goBack = () => {
      navigation.getParent()?.goBack();
    };
    setTimeout(async () => {
      const accountNumber = getText(I18N.signinStoreWalletAccountNumber, {
        number: `${wallets.getSize() + 1}`,
      });
      try {
        if (mnemonic) {
          let canNext = true;
          let index = 0;
          while (canNext) {
            const name =
              wallets.getSize() === 0 ? MAIN_ACCOUNT_NAME : accountNumber;

            const node = await restoreFromMnemonic(
              String(mnemonic),
              `${ETH_HD_SHORT_PATH}/${index}`,
            );

            if (!wallets.getWallet(node.address)) {
              const balance = await EthNetwork.getBalance(node.address);
              canNext = balance > 0 || index === 0;

              if (canNext) {
                const wallet = await wallets.addWallet(
                  {
                    address: node.address,
                    type: WalletType.mnemonic,
                    privateKey: node.privateKey,
                    mnemonic: node.mnemonic,
                    path: node.path,
                    rootAddress: node.rootAddress,
                    publicKey: '',
                  },
                  name,
                );

                if (wallet) {
                  wallet.mnemonicSaved = true;

                  const main = wallets.getMain();

                  if (!main) {
                    wallet.isMain = true;
                  }
                }
              } else {
                canNext = false;
              }
            }

            index += 1;
          }
        } else if (privateKey) {
          const name =
            wallets.getSize() === 0 ? MAIN_ACCOUNT_NAME : accountNumber;

          const wallet = await wallets.addWalletFromPrivateKey(
            privateKey,
            name,
          );

          if (wallet) {
            wallet.mnemonicSaved = true;
          }
        }

        navigation.navigate(nextScreen ?? 'onboardingFinish');
      } catch (error) {
        switch (error) {
          case 'wallet_already_exists':
            showModal('error-account-added');
            goBack();
            break;
          default:
            if (error instanceof Error) {
              showModal('error-create-account');
              captureException(error, 'restoreStore');
              goBack();
            }
        }
      }
    }, 350);
  }, [navigation, nextScreen, mnemonic, privateKey, wallets]);

  return <View />;
};
