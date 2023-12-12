import React, {useEffect} from 'react';

import {observer} from 'mobx-react';
import {View} from 'react-native';

import {showModal} from '@app/helpers';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {Wallet} from '@app/models/wallet';
import {
  KeystoneStackParamList,
  KeystoneStackRoutes,
} from '@app/screens/DeviceStack/KeystoneStack';
import {ModalType, WalletType} from '@app/types';
import {sleep} from '@app/utils';
import {KEYSTONE_NAME} from '@app/variables/common';

export const KeystoneStoreWalletScreen = observer(() => {
  const navigation = useTypedNavigation<KeystoneStackParamList>();
  const route = useTypedRoute<
    KeystoneStackParamList,
    KeystoneStackRoutes.KeystoneStoreWallet
  >();

  useEffect(() => {
    showModal(ModalType.loading, {
      text: getText(I18N.keystoneStoreWalletSaving),
    });
  }, []);

  useEffect(() => {
    setTimeout(() => {
      const actions = [sleep(1000)];

      const lastIndex = Wallet.getAll().filter(
        wallet =>
          wallet.type === WalletType.keystone &&
          wallet.name.includes(KEYSTONE_NAME),
      ).length;

      Logger.log('params', JSON.stringify(route?.params, null, 2));

      actions.push(
        Wallet.create(`${KEYSTONE_NAME} #${lastIndex}`, {
          type: WalletType.keystone,
          path: route.params.hdPath,
          address: route.params.address,
          accountId: route?.params?.cryptoHDKeyCBORHex,
        }),
      );

      Promise.all(actions)
        .then(() => {
          navigation.navigate(KeystoneStackRoutes.KeystoneFinish);
        })
        .catch(error => {
          switch (error) {
            case 'wallet_already_exists':
              showModal(ModalType.errorAccountAdded);
              navigation.getParent()?.goBack();
              break;
            default:
              if (error instanceof Error) {
                showModal(ModalType.errorCreateAccount);
                navigation.getParent()?.goBack();
                Logger.captureException(
                  error,
                  KeystoneStackRoutes.KeystoneStoreWallet,
                );
              }
          }
        });
    }, 350);
  }, [navigation, route]);

  return <View />;
});
