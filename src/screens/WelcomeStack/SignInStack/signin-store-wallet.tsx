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

import {ChooseAccountTabNames} from '@app/components/choose-account/choose-account';
import {app} from '@app/contexts';
import {hideModal, showModal} from '@app/helpers';
import {AddressUtils} from '@app/helpers/address-utils';
import {getTronProviderForNewWallet} from '@app/helpers/get-provider-for-new-wallet';
import {getProviderStorage} from '@app/helpers/get-provider-storage';
import {getWalletsFromProvider} from '@app/helpers/get-wallets-from-provider';
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

const logger = Logger.create('SignInStoreWalletScreen', {
  enabled: __DEV__ || app.isTesterMode || app.isDeveloper,
});

export const SignInStoreWalletScreen = observer(() => {
  logger.log('SignInStoreWalletScreen: Component rendering');
  const navigation = useTypedNavigation<SignInStackParamList>();
  logger.log('SignInStoreWalletScreen: Navigation hook initialized');
  const {nextScreen, ...params} = useTypedRoute<
    SignInStackParamList,
    SignInStackRoutes.SigninStoreWallet
  >().params;
  logger.log('SignInStoreWalletScreen: Route params extracted', {
    nextScreen,
    params,
  });

  const createSssFirstWallet = useCallback(
    async (provider: ProviderSSSBase) => {
      // @ts-ignore
      const item = (
        await getWalletsFromProvider(
          // @ts-ignore
          provider,
          WalletType.mnemonic,
          ChooseAccountTabNames.Basic,
        ).next()
      ).value;

      const total = Wallet.getAll().length;
      const name =
        total === 0
          ? getText(I18N.mainAccount)
          : getText(I18N.signinStoreWalletAccountNumber, {
              number: `${total + 1}`,
            });

      Wallet.create(name, {
        ...item,
        socialLinkEnabled: true,
        type: WalletType.sss,
      });

      // generate tron wallet address
      const tronProvider = await getTronProviderForNewWallet(
        item.type,
        item.accountId!,
      );

      if (!item.tronAddress) {
        const {address: tronAddress} = await tronProvider.getAccountInfo(
          // for tron coin type
          item.path?.replace?.(ETH_COIN_TYPE, TRON_COIN_TYPE)!,
        );
        Wallet.update(item.address, {
          tronAddress: tronAddress as AddressTron,
        });
      }

      const accountID = item.accountId;
      //@ts-ignore
      const storage = await getProviderStorage(accountID, params.sssProvider);
      await ProviderSSSBase.setStorageForAccount(accountID, storage);

      //@ts-ignore
      navigation.navigate(OnboardingStackRoutes.OnboardingFinish);
    },
    [],
  );

  useEffect(() => {
    logger.log('SignInStoreWalletScreen: Loading modal effect triggered');
    showModal(ModalType.loading, {text: getText(I18N.signinStoreWalletText)});
    logger.log('SignInStoreWalletScreen: Loading modal displayed');
  }, []);

  useEffect(() => {
    logger.log('SignInStoreWalletScreen: Main effect triggered');
    const goBack = () => {
      logger.log('SignInStoreWalletScreen: goBack function called');
      hideModal(ModalType.loading);
      logger.log('SignInStoreWalletScreen: Loading modal hidden');
      //@ts-expect-error
      navigation.replace(WelcomeStackRoutes.SignIn, {next: ''});
      logger.log('SignInStoreWalletScreen: Navigated back to SignIn screen');
    };
    setTimeout(async () => {
      logger.log('SignInStoreWalletScreen: Timeout callback initiated');
      try {
        logger.log('SignInStoreWalletScreen: Getting password function');
        const getPassword = app.getPassword.bind(app);

        logger.log('SignInStoreWalletScreen: Switching based on params type', {
          type: params.type,
        });
        switch (params.type) {
          case 'privateKey':
            logger.log('SignInStoreWalletScreen: Handling privateKey case');
            const total = Wallet.getAll().length;
            logger.log('SignInStoreWalletScreen: Total wallets', {total});

            const name =
              total === 0
                ? getText(I18N.mainAccount)
                : getText(I18N.signinStoreWalletAccountNumber, {
                    number: `${total + 1}`,
                  });
            logger.log('SignInStoreWalletScreen: Wallet name determined', {
              name,
            });

            const privateKeyValue = params.privateKey.value;
            let privateKey = privateKeyValue.startsWith('0x')
              ? privateKeyValue.slice(2)
              : privateKeyValue;
            logger.log('SignInStoreWalletScreen: Private key processed');

            logger.log('SignInStoreWalletScreen: Initializing ProviderHotBase');
            const provider = await ProviderHotBase.initialize(
              privateKey,
              app.getPassword.bind(app),
              {},
            );
            logger.log('SignInStoreWalletScreen: ProviderHotBase initialized');

            const tronHotProvider = new ProviderHotTron({
              account: provider.getIdentifier().toLowerCase(),
              getPassword: app.getPassword.bind(app),
              tronWebHostUrl: '',
            });

            const {address} = await provider.getAccountInfo('');
            const hotTronAccountInfo = await tronHotProvider.getAccountInfo('');

            logger.log('SignInStoreWalletScreen: Getting account info');
            logger.log('SignInStoreWalletScreen: Account info retrieved', {
              address,
            });

            logger.log('SignInStoreWalletScreen: Creating wallet');
            await Wallet.create(name, {
              path: '',
              address: AddressUtils.toEth(address),
              type: WalletType.hot,
              accountId: provider.getIdentifier().toLowerCase(),
              tronAddress: hotTronAccountInfo.address as AddressTron,
            });
            logger.log('SignInStoreWalletScreen: Wallet created');
            break;
          case 'mnemonic':
            logger.log('SignInStoreWalletScreen: Handling mnemonic case');
            logger.log(
              'SignInStoreWalletScreen: Initializing ProviderMnemonicBase',
            );
            const mnemonicProvider = await ProviderMnemonicBase.initialize(
              params.mnemonic.value,
              getPassword,
              {},
            );
            logger.log(
              'SignInStoreWalletScreen: ProviderMnemonicBase initialized',
            );

            logger.log('SignInStoreWalletScreen: Setting mnemonic as saved');

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
            logger.log('SignInStoreWalletScreen: Mnemonic marked as saved');

            logger.log(
              'SignInStoreWalletScreen: Wallets were created on previous step',
            );
            break;
          case 'sss':
            logger.log('SignInStoreWalletScreen: Handling sss case');
            //@ts-ignore
            logger.log('SignInStoreWalletScreen: Getting provider storage');
            const storage = await getProviderStorage('', params.provider);
            logger.log('SignInStoreWalletScreen: Provider storage retrieved');

            logger.log('SignInStoreWalletScreen: Getting password');
            const password = await getPassword();
            logger.log('SignInStoreWalletScreen: Password retrieved');

            logger.log('SignInStoreWalletScreen: Initializing ProviderSSSBase');
            const sssProvider = await ProviderSSSBase.initialize(
              params.sssPrivateKey,
              params.sssCloudShare,
              params.sssLocalShare,
              null,
              params.verifier,
              typeof params.token === 'string'
                ? params.token
                : params.token.value,
              app.getPassword.bind(app),
              storage,
              {
                metadataUrl: RemoteConfig.get('sss_metadata_url')!,
                generateSharesUrl: RemoteConfig.get('sss_generate_shares_url')!,
              },
            ).catch(err => {
              logger.error(
                'SignInStoreWalletScreen: Error in ProviderSSSBase initialization',
                {error: err},
              );
              return ErrorHandler.handle('sssLimitReached', err);
            });
            logger.log('SignInStoreWalletScreen: ProviderSSSBase initialized');

            if (!sssProvider) {
              logger.log(
                'SignInStoreWalletScreen: No sssProvider, hiding modal and going back',
              );
              hideModal('loading');
              goBack();
              return;
            }
            logger.log('SignInStoreWalletScreen: Updating pin');
            await sssProvider.updatePin(password);
            logger.log('SignInStoreWalletScreen: Pin updated');

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

            logger.log('SignInStoreWalletScreen: Creating SSS wallet');
            await createSssFirstWallet(sssProvider);
            logger.log('SignInStoreWalletScreen: SSS wallet created');
            break;
        }

        if (params.type !== 'sss') {
          logger.log('SignInStoreWalletScreen: Handling non-sss navigation');
          if (app.onboarded) {
            logger.log(
              'SignInStoreWalletScreen: App is onboarded, navigating to OnboardingSetupPin',
            );
            //@ts-ignore
            navigation.navigate(SignInStackRoutes.OnboardingSetupPin, {
              //@ts-expect-error
              screen: OnboardingStackRoutes.OnboardingFinish,
              params,
            });
            logger.log(
              'SignInStoreWalletScreen: Navigation to OnboardingSetupPin completed',
            );
            return;
          }

          logger.log(
            'SignInStoreWalletScreen: Navigating to next screen or onboardingFinish',
          );
          //@ts-ignore
          navigation.navigate(nextScreen ?? 'onboardingFinish', params);
          logger.log('SignInStoreWalletScreen: Navigation completed');
        }
      } catch (error) {
        logger.error('SignInStoreWalletScreen: Error in restoreStore', {error});
        Logger.captureException(error, 'restoreStore');
        switch (error) {
          case 'wallet_already_exists':
            logger.log(
              'SignInStoreWalletScreen: Wallet already exists, showing error modal',
            );
            showModal(ModalType.errorAccountAdded);
            goBack();
            break;
          default:
            if (error instanceof Error) {
              logger.log('SignInStoreWalletScreen: Unhandled error', {
                message: error.message,
              });
              showModal(ModalType.errorCreateAccount);
              goBack();
            }
        }
      } finally {
        logger.log('SignInStoreWalletScreen: Hiding loading modal');
        hideModal('loading');
      }
    }, 350);
  }, [navigation, nextScreen, params]);

  logger.log('SignInStoreWalletScreen: Rendering null');
  return null;
});
