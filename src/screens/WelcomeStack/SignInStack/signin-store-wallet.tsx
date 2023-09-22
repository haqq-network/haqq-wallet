import {memo, useEffect} from 'react';

import {GENERATE_SHARES_URL, METADATA_URL} from '@env';
import {ProviderHotReactNative} from '@haqq/provider-hot-react-native';
import {ProviderMnemonicReactNative} from '@haqq/provider-mnemonic-react-native';
import {ProviderSSSReactNative} from '@haqq/provider-sss-react-native';

import {app} from '@app/contexts';
import {hideModal, showModal} from '@app/helpers';
import {createWalletsForProvider} from '@app/helpers/create-wallets-for-provider';
import {getProviderStorage} from '@app/helpers/get-provider-storage';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {Wallet} from '@app/models/wallet';
import {
  SignInStackParamList,
  SignInStackRoutes,
} from '@app/screens/WelcomeStack/SignInStack';
import {RemoteConfig} from '@app/services/remote-config';
import {WalletType} from '@app/types';
import {MAIN_ACCOUNT_NAME} from '@app/variables/common';

export const SignInStoreWalletScreen = memo(() => {
  console.log('SignInStoreWalletScreen');
  const navigation = useTypedNavigation<SignInStackParamList>();
  const {nextScreen, ...params} = useTypedRoute<
    SignInStackParamList,
    SignInStackRoutes.SigninStoreWallet
  >().params;

  useEffect(() => {
    console.log('here');
    // showModal('loading', {text: getText(I18N.signinStoreWalletText)});
  }, []);

  useEffect(() => {
    const goBack = () => {
      console.log('goback');
      hideModal('loading');
      navigation.replace('signin', {next: ''});
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

            // Wallets were created on previous step
            break;
          case 'sss':
            const storage = await getProviderStorage();

            const sssProvider = await ProviderSSSReactNative.initialize(
              params.sssPrivateKey,
              params.sssCloudShare,
              params.sssLocalShare,
              null,
              params.verifier,
              params.token,
              app.getPassword.bind(app),
              storage,
              {
                metadataUrl: RemoteConfig.get_env(
                  'sss_metadata_url',
                  METADATA_URL,
                ) as string,
                generateSharesUrl: RemoteConfig.get_env(
                  'sss_generate_shares_url',
                  GENERATE_SHARES_URL,
                ) as string,
              },
            );

            await createWalletsForProvider(sssProvider, WalletType.sss);
            break;
        }

        console.log('next');
        navigation.navigate(SignInStackRoutes.OnboardingSetupPin, params);
      } catch (error) {
        console.log(error);
        Logger.captureException(error, 'restoreStore');
        switch (error) {
          case 'wallet_already_exists':
            // showModal('errorAccountAdded');
            goBack();
            break;
          default:
            if (error instanceof Error) {
              Logger.log('error.message', error.message);
              // showModal('errorCreateAccount');
              goBack();
            }
        }
      }
    }, 350);
  }, [navigation, nextScreen, params]);

  return null;
});
