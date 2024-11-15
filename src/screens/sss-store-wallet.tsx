//@ts-nocheck
import React, {useEffect} from 'react';

import {ProviderSSSBase} from '@haqq/rn-wallet-providers';
import {observer} from 'mobx-react';

import {app} from '@app/contexts';
import {hideModal, showModal} from '@app/helpers';
import {getProviderStorage} from '@app/helpers/get-provider-storage';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {ErrorHandler} from '@app/models/error-handler';
import {Wallet} from '@app/models/wallet';
import {navigator} from '@app/navigator';
import {RemoteConfig} from '@app/services/remote-config';
import {ModalType, WalletType} from '@app/types';
import {ETH_HD_SHORT_PATH} from '@app/variables/common';

const logger = Logger.create('SssStoreWalletScreen', {
  enabled: AppStore.isLogsEnabled,
});

export const SssStoreWalletScreen = observer(() => {
  logger.log('SssStoreWalletScreen: Component rendering');
  const route = useTypedRoute<'sssStoreWallet'>();
  logger.log('SssStoreWalletScreen: Retrieved typed route', {
    params: route.params,
  });
  const navigation = useTypedNavigation();
  logger.log('SssStoreWalletScreen: Retrieved typed navigation');

  useEffect(() => {
    logger.log('SssStoreWalletScreen: Showing loading modal');
    showModal(ModalType.loading, {text: getText(I18N.sssStoreWalletSaving)});
  }, []);

  useEffect(() => {
    logger.log('SssStoreWalletScreen: Starting main effect');
    setTimeout(async () => {
      logger.log('SssStoreWalletScreen: Timeout started');
      try {
        logger.log('SssStoreWalletScreen: Getting provider storage');
        const storage = await getProviderStorage();
        logger.log('SssStoreWalletScreen: Provider storage retrieved');

        logger.log('SssStoreWalletScreen: Initializing ProviderSSSBase');
        const provider = await ProviderSSSBase.initialize(
          route.params.privateKey,
          route.params.cloudShare,
          route.params.localShare,
          null,
          route.params.verifier,
          typeof route.params.token === 'string'
            ? route.params.token
            : route.params.token.value,
          app.getPassword.bind(app),
          storage,
          {
            metadataUrl: RemoteConfig.get('sss_metadata_url')!,
            generateSharesUrl: RemoteConfig.get('sss_generate_shares_url')!,
          },
        ).catch(err => {
          logger.log(
            'SssStoreWalletScreen: Error initializing ProviderSSSBase',
            {error: err},
          );
          return ErrorHandler.handle('sssLimitReached', err);
        });
        logger.log('SssStoreWalletScreen: ProviderSSSBase initialized');

        let canNext = true;
        let index = 0;

        logger.log('SssStoreWalletScreen: Starting wallet creation loop');
        while (canNext) {
          logger.log('SssStoreWalletScreen: Loop iteration', {index});
          const total = Wallet.getAll().length;
          logger.log('SssStoreWalletScreen: Total wallets', {total});

          const name =
            total === 0
              ? getText(I18N.mainAccount)
              : getText(I18N.signinStoreWalletAccountNumber, {
                  number: `${total + 1}`,
                });
          logger.log('SssStoreWalletScreen: Wallet name determined', {name});

          const hdPath = `${ETH_HD_SHORT_PATH}/${index}`;
          logger.log('SssStoreWalletScreen: HD path created', {hdPath});

          logger.log('SssStoreWalletScreen: Getting account info');
          const {address} = await provider.getAccountInfo(hdPath);
          logger.log('SssStoreWalletScreen: Account info retrieved', {address});

          if (!Wallet.getById(address)) {
            logger.log(
              'SssStoreWalletScreen: Wallet not found, proceeding with creation',
            );

            const balance = Wallet.getBalance(address, 'available');
            logger.log('SssStoreWalletScreen: Retrieved balance', {
              balance: balance.toString(),
            });
            canNext = balance.isPositive() || index === 0;
            logger.log('SssStoreWalletScreen: Determined if can proceed', {
              canNext,
            });

            if (canNext) {
              logger.log('SssStoreWalletScreen: Creating new wallet');
              // generate tron wallet address
              const tronProvider = new ProviderSSSTron({
                account: provider.getIdentifier(),
                getPassword: app.getPassword.bind(app),
                tronWebHostUrl: '',
                storage,
              });
              const {address: tronAddress} = await tronProvider.getAccountInfo(
                hdPath.replace(ETH_COIN_TYPE, TRON_COIN_TYPE),
              );
              await Wallet.create(name, {
                address: address,
                type: WalletType.sss,
                path: hdPath,
                accountId: provider.getIdentifier(),
                socialLinkEnabled: true,
                tronAddress: tronAddress as AddressTron,
              });
              logger.log('SssStoreWalletScreen: Wallet created');
            }
          } else {
            logger.log('SssStoreWalletScreen: Wallet already exists', {
              address,
            });
          }

          index += 1;
          logger.log('SssStoreWalletScreen: Incremented index', {
            newIndex: index,
          });
        }

        logger.log('SssStoreWalletScreen: Navigating to sssFinish');
        navigation.navigate('sssFinish');
      } catch (e) {
        logger.log('SssStoreWalletScreen: Caught error', {error: e});
        switch (e) {
          case 'wallet_already_exists':
            logger.log('SssStoreWalletScreen: Wallet already exists error');
            showModal(ModalType.errorAccountAdded);
            navigator.goBack();
            break;
          default:
            if (e instanceof Error) {
              logger.log('SssStoreWalletScreen: Unhandled error');
              showModal(ModalType.errorCreateAccount);
              navigator.goBack();
              logger.captureException(e, 'SssStoreWalletScreen');
            }
        }
      } finally {
        logger.log('SssStoreWalletScreen: Hiding loading modal');
        hideModal(ModalType.loading);
      }
    }, 350);
  }, [navigation, route]);

  logger.log('SssStoreWalletScreen: Rendering empty fragment');
  return <></>;
});
