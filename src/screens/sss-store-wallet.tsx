// @ts-nocheck
import React, {useEffect} from 'react';

import {GENERATE_SHARES_URL, METADATA_URL} from '@env';
import {ProviderSSSReactNative} from '@haqq/provider-sss-react-native';

import {app} from '@app/contexts';
import {hideModal, showModal} from '@app/helpers';
import {getProviderStorage} from '@app/helpers/get-provider-storage';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {ErrorHandler} from '@app/models/error-handler';
import {Wallet} from '@app/models/wallet';
import {navigator} from '@app/navigator';
import {RemoteConfig} from '@app/services/remote-config';
import {ModalType} from '@app/types';
import {WalletType} from '@app/types';
import {ETH_HD_SHORT_PATH, MAIN_ACCOUNT_NAME} from '@app/variables/common';

export const SssStoreWalletScreen = () => {
  const route = useTypedRoute<'sssStoreWallet'>();
  const navigation = useTypedNavigation();

  useEffect(() => {
    showModal(ModalType.loading, {text: getText(I18N.sssStoreWalletSaving)});
  }, []);

  useEffect(() => {
    setTimeout(async () => {
      try {
        const storage = await getProviderStorage();

        const provider = await ProviderSSSReactNative.initialize(
          route.params.privateKey,
          route.params.cloudShare,
          route.params.localShare,
          null,
          route.params.verifier,
          route.params.token,
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
        ).catch(err => ErrorHandler.handle('sssLimitReached', err));

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
            const balance = app.getAvailableBalance(address);
            canNext = balance.isPositive() || index === 0;

            if (canNext) {
              await Wallet.create(name, {
                address: address,
                type: WalletType.sss,
                path: hdPath,
                accountId: provider.getIdentifier(),
                socialLinkEnabled: true,
              });
            }
          }

          index += 1;
        }

        navigation.navigate('sssFinish');
      } catch (e) {
        Logger.log(e);
        switch (e) {
          case 'wallet_already_exists':
            showModal(ModalType.errorAccountAdded);
            navigator.goBack();
            break;
          default:
            if (e instanceof Error) {
              showModal(ModalType.errorCreateAccount);
              navigator.goBack();
              Logger.captureException(e, 'SssStoreWalletScreen');
            }
        }
      } finally {
        hideModal(ModalType.loading);
      }
    }, 350);
  }, [navigation, route]);

  return <></>;
};
