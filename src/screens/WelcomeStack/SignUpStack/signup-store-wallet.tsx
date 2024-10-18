import {useCallback, useEffect} from 'react';

import {
  ProviderMnemonicTron,
  ProviderSSSBase,
  ProviderSSSEvm,
} from '@haqq/rn-wallet-providers';
import {observer} from 'mobx-react';

import {app} from '@app/contexts';
import {hideModal, showModal} from '@app/helpers';
import {AddressUtils} from '@app/helpers/address-utils';
import {getProviderForNewWallet} from '@app/helpers/get-provider-for-new-wallet';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {Wallet} from '@app/models/wallet';
import {
  SignInStackRoutes,
  SignUpStackParamList,
  SignUpStackRoutes,
  WelcomeStackRoutes,
} from '@app/route-types';
import {SssProviders} from '@app/services/provider-sss';
import {AddressTron, ModalType, WalletType} from '@app/types';
import {ETH_HD_SHORT_PATH} from '@app/variables/common';

export const SignUpStoreWalletScreen = observer(() => {
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

  const getCurrentProvider = useCallback(async () => {
    //@ts-ignore
    const {provider} = route.params;
    if (!provider || typeof provider === 'string') {
      return await getProviderForNewWallet(route.params);
    }
    return provider;
  }, [route.params]);

  const getWalletType = useCallback(() => {
    if (
      //@ts-ignore
      route.params.sssPrivateKey ||
      //@ts-ignore
      route.params.provider instanceof ProviderSSSBase ||
      //@ts-ignore
      route.params.provider instanceof ProviderSSSEvm ||
      //@ts-ignore
      Object.values(SssProviders).includes(route.params.provider)
    ) {
      return WalletType.sss;
    }

    return WalletType.mnemonic;
  }, [route.params]);

  const getWalletIndex = (nextIndex: number) => {
    if (Wallet.getSize() > 0 && isNaN(nextIndex)) {
      return 1;
    }
    if (!nextIndex) {
      return 0;
    }
    return nextIndex;
  };

  useEffect(() => {
    setTimeout(async () => {
      try {
        const provider = await getCurrentProvider();

        // sssLimitReached
        if (!provider || typeof provider?.getIdentifier !== 'function') {
          hideModal('loading');
          goBack();
          return;
        }

        if (
          getWalletType() === WalletType.sss &&
          app.onboarded === false &&
          route.params.type === 'sss'
        ) {
          hideModal('loading');
          const sssProvider = route.params.provider;
          //@ts-ignore
          navigation.navigate(WelcomeStackRoutes.SignIn, {
            screen: SignInStackRoutes.SigninChooseAccount,
            params: {provider, sssProvider},
          });
          return;
        }

        const accountWallets = Wallet.getForAccount(provider.getIdentifier());
        const nextHdPathIndex = accountWallets.reduce((memo, wallet) => {
          const segments = wallet.path?.split('/') ?? ['0'];
          return Math.max(
            memo,
            parseInt(segments[segments.length - 1], 10) + 1,
          );
        }, 0);

        const walletIndex = getWalletIndex(nextHdPathIndex);
        const walletsTotalCount = Wallet.getSize();

        const hdPath = `${ETH_HD_SHORT_PATH}/${walletIndex}`;
        const total = Wallet.getAll().length;
        const name =
          walletsTotalCount === 0
            ? getText(I18N.mainAccount)
            : getText(I18N.signupStoreWalletAccountNumber, {
                number: `${total + 1}`,
              });

        try {
          const {address} = await provider.getAccountInfo(hdPath);
          const tronProvider = new ProviderMnemonicTron({
            account: provider.getIdentifier(),
            getPassword: app.getPassword.bind(app),
            tronWebHostUrl: '',
          });
          const {address: tronAddress} = await tronProvider.getAccountInfo(
            hdPath,
          );
          const type = getWalletType();

          await Wallet.create(name, {
            address: AddressUtils.toEth(address),
            tronAddress: tronAddress as AddressTron,
            accountId: provider.getIdentifier(),
            path: hdPath,
            type,
            socialLinkEnabled: type === WalletType.sss,
            mnemonicSaved: !!accountWallets.find(
              wallet => !!wallet.mnemonicSaved,
            ),
          });
        } catch (err) {
          if (getWalletType() === WalletType.sss) {
            hideModal('loading');
            showModal('sssLimitReached');
            goBack();
            return;
          } else {
            throw err;
          }
        }

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
              Logger.captureException(error, 'createStoreWallet');
              showModal(ModalType.errorCreateAccount);
              goBack();
            }
        }
      }
    }, 350);
  }, [goBack, navigation, route.params]);

  return null;
});
