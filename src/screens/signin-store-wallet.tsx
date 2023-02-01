import React, {useEffect} from 'react';

import {ProviderHotReactNative} from '@haqq/provider-hot-react-native';
import {
  accountInfo,
  derive,
  seedFromMnemonic,
} from '@haqq/provider-web3-utils/src';
import {View} from 'react-native';

import {app} from '@app/contexts';
import {captureException, showModal} from '@app/helpers';
import {useTypedNavigation, useTypedRoute, useWallets} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {Wallet} from '@app/models/wallet';
import {EthNetwork} from '@app/services';
import {WalletType} from '@app/types';
import {ETH_HD_SHORT_PATH, MAIN_ACCOUNT_NAME} from '@app/variables/common';

export const SignInStoreWalletScreen = () => {
  const navigation = useTypedNavigation();
  const {nextScreen, mnemonic, privateKey} =
    useTypedRoute<'restoreStore'>().params;
  const wallets = useWallets();

  useEffect(() => {
    showModal('loading', {text: getText(I18N.signinStoreWalletText)});
  }, []);

  useEffect(() => {
    const goBack = () => {
      navigation.getParent()?.goBack();
    };
    setTimeout(async () => {
      try {
        if (mnemonic) {
          let canNext = true;
          let index = 0;

          const seed = await seedFromMnemonic(mnemonic);
          const rootPrivateKey = await derive(seed, 'm');
          const rootInfo = await accountInfo(rootPrivateKey);

          while (canNext) {
            const total = Wallet.getAll().length;
            const accountNumber = getText(I18N.signinStoreWalletAccountNumber, {
              number: `${total + 1}`,
            });

            const name = total === 0 ? MAIN_ACCOUNT_NAME : accountNumber;

            const path = `${ETH_HD_SHORT_PATH}/${index}`;
            const pk = await derive(seed, path);
            const {address} = await accountInfo(pk);

            const existsWallet = Wallet.getById(address);

            if (!existsWallet) {
              const balance = await EthNetwork.getBalance(address);
              canNext = balance > 0 || index === 0;

              if (canNext) {
                const wallet = await wallets.addWallet(
                  {
                    address: address,
                    type: WalletType.mnemonic,
                    privateKey: pk,
                    mnemonic: mnemonic,
                    path: path,
                    rootAddress: rootInfo.address,
                    accountId: '',
                  },
                  name,
                );

                if (wallet) {
                  const main = wallets.getMain();

                  wallet.update({
                    mnemonicSaved: true,
                    isMain: !main,
                  });
                }
              } else {
                canNext = false;
              }
            }

            index += 1;
          }
        } else if (privateKey) {
          const total = Wallet.getAll().length;
          const accountNumber = getText(I18N.signinStoreWalletAccountNumber, {
            number: `${total + 1}`,
          });

          const name = total === 0 ? MAIN_ACCOUNT_NAME : accountNumber;

          const provider = await ProviderHotReactNative.initialize(
            privateKey,
            app.getPassword.bind(app),
            {},
          );

          const {address} = await provider.getAccountInfo('');
          const accountId = provider.getIdentifier();

          const wallet = await wallets.addWallet(
            {
              path: '',
              address: address,
              type: WalletType.hot,
              accountId: accountId,
            },
            name,
          );

          if (wallet) {
            wallet.update({mnemonicSaved: true});
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
              console.log('error.message', error.message);
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
