import React, {memo, useEffect} from 'react';

import {GENERATE_SHARES_URL, METADATA_URL} from '@env';
import {ProviderHotReactNative} from '@haqq/provider-hot-react-native';
import {ProviderMnemonicReactNative} from '@haqq/provider-mnemonic-react-native';
import {ProviderSSSReactNative} from '@haqq/provider-sss-react-native';
import {View} from 'react-native';

import {app} from '@app/contexts';
import {createWalletsForProvider} from '@app/helpers/create-wallets-for-provider';
import {getProviderStorage} from '@app/helpers/get-provider-storage';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {useModal} from '@app/hooks/use-modal';
import {I18N, getText} from '@app/i18n';
import {Wallet} from '@app/models/wallet';
import {OnboardingStackRoutes} from '@app/screens/WelcomeStack/OnboardingStack';
import {
  SignInStackParamList,
  SignInStackRoutes,
} from '@app/screens/WelcomeStack/SignInStack';
import {WalletType} from '@app/types';
import {MAIN_ACCOUNT_NAME} from '@app/variables/common';

export const SignInStoreWalletScreen = memo(() => {
  const navigation = useTypedNavigation<SignInStackParamList>();
  const {nextScreen, ...params} = useTypedRoute<
    SignInStackParamList,
    SignInStackRoutes.SigninStoreWallet
  >().params;

  const [show] = useModal();

  useEffect(() => {
    show('loading', {text: getText(I18N.signinStoreWalletText)});
  }, [show]);

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

            let privateKey = params.privateKey.startsWith('0x')
              ? params.privateKey.slice(2)
              : params.privateKey;

            const provider = await ProviderHotReactNative.initialize(
              privateKey,
              app.getPassword.bind(app),
              {},
            );

            const {address} = await provider.getAccountInfo('');

            await Wallet.create(
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
          case 'sss':
            const storage = await getProviderStorage();

            const sssProvider = await ProviderSSSReactNative.initialize(
              params.sssPrivateKey,
              params.sssCloudShare,
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

            await createWalletsForProvider(sssProvider, WalletType.sss);
            break;
        }

        // TODO: Check nav stack
        // navigation.navigate(
        //   nextScreen || OnboardingStackRoutes.OnboardingFinish,
        // );
        // FIXME:
        navigation.navigate(OnboardingStackRoutes.OnboardingSetupPin, {
          screen: nextScreen || OnboardingStackRoutes.OnboardingFinish,
        });
      } catch (error) {
        switch (error) {
          case 'wallet_already_exists':
            show('errorAccountAdded');
            goBack();
            break;
          default:
            if (error instanceof Error) {
              Logger.log('error.message', error.message);
              show('errorCreateAccount');
              goBack();
              Logger.captureException(error, 'restoreStore');
            }
        }
      }
    }, 350);
  }, [navigation, nextScreen, params, show]);

  return <View />;
});
