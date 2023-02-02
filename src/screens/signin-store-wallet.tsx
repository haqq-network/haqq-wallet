import React, {useEffect} from 'react';

import {ProviderHotReactNative} from '@haqq/provider-hot-react-native';
import {ProviderMnemonicReactNative} from '@haqq/provider-mnemonic-react-native';
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
        const getPassword = app.getPassword.bind(app);

        if (mnemonic) {
          const provider = await ProviderMnemonicReactNative.initialize(
            mnemonic,
            getPassword,
            {},
          );

          let canNext = true;
          let index = 0;

          while (canNext) {
            const total = Wallet.getAll().length;

            const name =
              total === 0
                ? MAIN_ACCOUNT_NAME
                : getText(I18N.signinStoreWalletAccountNumber, {
                    number: `${total + 1}`,
                  });

            const hdPath = `${ETH_HD_SHORT_PATH}/${index}`;

            const {address} = await provider.getAccountInfo(hdPath);

            if (!Wallet.getById(address)) {
              const balance = await EthNetwork.getBalance(address);
              canNext = balance > 0 || index === 0;

              if (canNext) {
                await wallets.addWallet(
                  {
                    address: address,
                    type: WalletType.mnemonic,
                    path: hdPath,
                    accountId: provider.getIdentifier(),
                  },
                  name,
                );
              } else {
                canNext = false;
              }
            }

            index += 1;
          }
        } else if (privateKey) {
          const total = Wallet.getAll().length;

          const name =
            total === 0
              ? MAIN_ACCOUNT_NAME
              : getText(I18N.signinStoreWalletAccountNumber, {
                  number: `${total + 1}`,
                });

          const provider = await ProviderHotReactNative.initialize(
            privateKey,
            app.getPassword.bind(app),
            {},
          );

          const {address} = await provider.getAccountInfo('');

          await wallets.addWallet(
            {
              path: '',
              address: address,
              type: WalletType.hot,
              accountId: provider.getIdentifier().toLowerCase(),
            },
            name,
          );
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
