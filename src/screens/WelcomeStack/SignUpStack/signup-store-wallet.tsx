import {useCallback, useEffect} from 'react';

import {ProviderSSSReactNative} from '@haqq/provider-sss-react-native';

import {hideModal, showModal} from '@app/helpers';
import {AddressUtils} from '@app/helpers/address-utils';
import {getProviderForNewWallet} from '@app/helpers/get-provider-for-new-wallet';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {Wallet} from '@app/models/wallet';
import {WelcomeStackRoutes} from '@app/screens/WelcomeStack';
import {
  SignUpStackParamList,
  SignUpStackRoutes,
} from '@app/screens/WelcomeStack/SignUpStack';
import {ModalType} from '@app/types';
import {WalletType} from '@app/types';
import {ETH_HD_SHORT_PATH, MAIN_ACCOUNT_NAME} from '@app/variables/common';

export const SignUpStoreWalletScreen = () => {
  const navigation = useTypedNavigation<SignUpStackParamList>();
  const route = useTypedRoute<
    SignUpStackParamList,
    SignUpStackRoutes.SignupStoreWallet
  >();

  const goBack = useCallback(() => {
    hideModal(ModalType.loading);
    navigation.replace(WelcomeStackRoutes.SignUp);
  }, [navigation]);

  useEffect(() => {
    showModal(ModalType.loading, {
      text: getText(I18N.signupStoreWalletCreatingAccount),
    });
  }, []);

  useEffect(() => {
    setTimeout(async () => {
      try {
        const provider =
          //@ts-ignore
          route.params.provider ||
          (await getProviderForNewWallet(route.params));
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
          //@ts-ignore
          route.params.sssPrivateKey ||
          //@ts-ignore
          route.params.provider instanceof ProviderSSSReactNative
            ? WalletType.sss
            : WalletType.mnemonic;

        await Wallet.create(name, {
          address: AddressUtils.toEth(address),
          accountId: provider.getIdentifier(),
          path: hdPath,
          type,
          socialLinkEnabled: type === WalletType.sss,
        });

        //@ts-ignore
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

  return null;
};
