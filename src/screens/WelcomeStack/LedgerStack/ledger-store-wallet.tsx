import React, {memo, useEffect} from 'react';

import {View} from 'react-native';

import {showModal} from '@app/helpers';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {Wallet} from '@app/models/wallet';
import {
  LedgerStackParamList,
  LedgerStackRoutes,
} from '@app/screens/WelcomeStack/LedgerStack';
import {ModalType} from '@app/types';
import {WalletType} from '@app/types';
import {sleep} from '@app/utils';

export const LedgerStoreWalletScreen = memo(() => {
  const navigation = useTypedNavigation<LedgerStackParamList>();
  const route = useTypedRoute<
    LedgerStackParamList,
    LedgerStackRoutes.LedgerStoreWallet
  >();

  useEffect(() => {
    showModal(ModalType.loading, {text: getText(I18N.ledgerStoreWalletSaving)});
  }, []);

  useEffect(() => {
    setTimeout(() => {
      const actions = [sleep(1000)];

      const lastIndex = route.params.hdPath.split('/').pop() ?? '0';

      actions.push(
        Wallet.create(`${route?.params?.deviceName} #${lastIndex}`, {
          type: WalletType.ledgerBt,
          path: route.params.hdPath,
          address: route.params.address,
          accountId: route?.params?.deviceId,
        }),
      );

      Promise.all(actions)
        .then(() => {
          navigation.navigate(LedgerStackRoutes.LedgerFinish);
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
                  LedgerStackRoutes.LedgerStoreWallet,
                );
              }
          }
        });
    }, 350);
  }, [navigation, route]);

  return <View />;
});
