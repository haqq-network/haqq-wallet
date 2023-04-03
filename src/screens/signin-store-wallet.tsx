import React, {useEffect} from 'react';

import {GENERATE_SHARES_URL, METADATA_URL} from '@env';
import {ProviderHotReactNative} from '@haqq/provider-hot-react-native';
import {ProviderMnemonicReactNative} from '@haqq/provider-mnemonic-react-native';
import {ProviderMpcReactNative} from '@haqq/provider-mpc-react-native';
import {View} from 'react-native';

import {app} from '@app/contexts';
import {captureException, showModal} from '@app/helpers';
import {createWalletsForProvider} from '@app/helpers/create-wallets-for-provider';
import {getProviderStorage} from '@app/helpers/get-provider-storage';
import {useTypedNavigation, useTypedRoute, useWallets} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {Wallet} from '@app/models/wallet';
import {WalletType} from '@app/types';
import {MAIN_ACCOUNT_NAME} from '@app/variables/common';

export const SignInStoreWalletScreen = () => {
  const navigation = useTypedNavigation();
  const {nextScreen, ...params} = useTypedRoute<'restoreStore'>().params;
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

        switch (params.type) {
          case 'privateKey':
            const total = Wallet.getAll().length;

            const name =
              total === 0
                ? MAIN_ACCOUNT_NAME
                : getText(I18N.signinStoreWalletAccountNumber, {
                    number: `${total + 1}`,
                  });

            const provider = await ProviderHotReactNative.initialize(
              params.privateKey,
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
            break;
          case 'mnemonic':
            const mnemonicProvider =
              await ProviderMnemonicReactNative.initialize(
                params.mnemonic,
                getPassword,
                {},
              );

            await mnemonicProvider.setMnemonicSaved();

            await createWalletsForProvider(
              mnemonicProvider,
              WalletType.mnemonic,
            );
            break;
          case 'mpc':
            const storage = await getProviderStorage();

            const mpcProvider = await ProviderMpcReactNative.initialize(
              params.mpcPrivateKey,
              params.mpcCloudShare,
              null,
              params.verifier,
              params.token,
              app.getPassword.bind(app),
              storage,
              {
                metadataUrl: METADATA_URL,
                generateSharesUrl: GENERATE_SHARES_URL,
              },
            );

            await createWalletsForProvider(mpcProvider, WalletType.mpc);
            break;
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
  }, [navigation, nextScreen, wallets, params]);

  return <View />;
};
