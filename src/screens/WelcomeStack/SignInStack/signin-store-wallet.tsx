import {useEffect} from 'react';

import {
  ProviderHotBase,
  ProviderHotTron,
  ProviderMnemonicBase,
  ProviderMnemonicTron,
  ProviderSSSBase,
  ProviderSSSTron,
} from '@haqq/rn-wallet-providers';
import {observer} from 'mobx-react';

import {app} from '@app/contexts';
import {hideModal, showModal} from '@app/helpers';
import {AddressUtils} from '@app/helpers/address-utils';
import {getProviderStorage} from '@app/helpers/get-provider-storage';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {ErrorHandler} from '@app/models/error-handler';
import {Wallet} from '@app/models/wallet';
import {
  OnboardingStackRoutes,
  SignInStackParamList,
  SignInStackRoutes,
  WelcomeStackRoutes,
} from '@app/route-types';
import {RemoteConfig} from '@app/services/remote-config';
import {AddressTron, ModalType, WalletType} from '@app/types';
import {ETH_COIN_TYPE, TRON_COIN_TYPE} from '@app/variables/common';

export const SignInStoreWalletScreen = observer(() => {
  const navigation = useTypedNavigation<SignInStackParamList>();
  const {nextScreen, ...params} = useTypedRoute<
    SignInStackParamList,
    SignInStackRoutes.SigninStoreWallet
  >().params;

  useEffect(() => {
    showModal(ModalType.loading, {text: getText(I18N.signinStoreWalletText)});
  }, []);

  useEffect(() => {
    const goBack = () => {
      hideModal(ModalType.loading);
      //@ts-expect-error
      navigation.replace(WelcomeStackRoutes.SignIn, {next: ''});
    };
    setTimeout(async () => {
      try {
        const getPassword = app.getPassword.bind(app);

        switch (params.type) {
          case 'privateKey':
            const total = Wallet.getAll().length;

            const name =
              total === 0
                ? getText(I18N.mainAccount)
                : getText(I18N.signinStoreWalletAccountNumber, {
                    number: `${total + 1}`,
                  });

            const privateKeyValue = params.privateKey.value;
            let privateKey = privateKeyValue.startsWith('0x')
              ? privateKeyValue.slice(2)
              : privateKeyValue;

            const provider = await ProviderHotBase.initialize(
              privateKey,
              app.getPassword.bind(app),
              {},
            );

            const tronHotProvider = new ProviderHotTron({
              account: provider.getIdentifier().toLowerCase(),
              getPassword: app.getPassword.bind(app),
              tronWebHostUrl: '',
            });

            const {address} = await provider.getAccountInfo('');
            const hotTronAccountInfo = await tronHotProvider.getAccountInfo('');

            await Wallet.create(name, {
              path: '',
              address: AddressUtils.toEth(address),
              type: WalletType.hot,
              accountId: provider.getIdentifier().toLowerCase(),
              tronAddress: hotTronAccountInfo.address as AddressTron,
            });
            break;
          case 'mnemonic':
            const mnemonicProvider = await ProviderMnemonicBase.initialize(
              params.mnemonic.value,
              getPassword,
              {},
            );

            Wallet.getForAccount(mnemonicProvider.getIdentifier()).forEach(
              async wallet => {
                const tronMnemonicProvider = new ProviderMnemonicTron({
                  account: wallet.accountId!,
                  getPassword,
                  tronWebHostUrl: '',
                });
                const tronMnemonicAccountInfo =
                  await tronMnemonicProvider.getAccountInfo(
                    wallet.path?.replace?.(ETH_COIN_TYPE, TRON_COIN_TYPE)!,
                  );
                Wallet.update(wallet.address, {
                  tronAddress: tronMnemonicAccountInfo.address as AddressTron,
                });
              },
            );

            await mnemonicProvider.setMnemonicSaved();

            // Wallets were created on previous step
            break;
          case 'sss':
            //@ts-ignore
            const storage = await getProviderStorage('', params.provider);
            const password = await getPassword();

            const sssProvider = await ProviderSSSBase.initialize(
              params.sssPrivateKey,
              params.sssCloudShare,
              params.sssLocalShare,
              null,
              params.verifier,
              params.token.value,
              app.getPassword.bind(app),
              storage,
              {
                metadataUrl: RemoteConfig.get('sss_metadata_url')!,
                generateSharesUrl: RemoteConfig.get('sss_generate_shares_url')!,
              },
            ).catch(err => ErrorHandler.handle('sssLimitReached', err));

            if (!sssProvider) {
              hideModal('loading');
              goBack();
              return;
            }
            await sssProvider.updatePin(password);

            Wallet.getForAccount(sssProvider.getIdentifier()).forEach(
              async wallet => {
                const tronSSSProvider = new ProviderSSSTron({
                  account: wallet.accountId!,
                  getPassword,
                  tronWebHostUrl: '',
                  storage,
                });

                const tronSSSAccountInfo = await tronSSSProvider.getAccountInfo(
                  wallet.path?.replace?.(ETH_COIN_TYPE, TRON_COIN_TYPE)!,
                );
                Wallet.update(wallet.address, {
                  tronAddress: tronSSSAccountInfo.address as AddressTron,
                });
              },
            );

            navigation.navigate(SignInStackRoutes.SigninChooseAccount, {
              sssProvider: params.provider,
              provider: sssProvider,
            });
            break;
        }

        if (params.type !== 'sss') {
          if (app.onboarded) {
            //@ts-ignore
            navigation.navigate(SignInStackRoutes.OnboardingSetupPin, {
              //@ts-expect-error
              screen: OnboardingStackRoutes.OnboardingFinish,
              params,
            });
            return;
          }

          //@ts-ignore
          navigation.navigate(nextScreen ?? 'onboardingFinish', params);
        }
      } catch (error) {
        Logger.captureException(error, 'restoreStore');
        switch (error) {
          case 'wallet_already_exists':
            showModal(ModalType.errorAccountAdded);
            goBack();
            break;
          default:
            if (error instanceof Error) {
              Logger.log('error.message', error.message);
              showModal(ModalType.errorCreateAccount);
              goBack();
            }
        }
      } finally {
        hideModal('loading');
      }
    }, 350);
  }, [navigation, nextScreen, params]);

  return null;
});
