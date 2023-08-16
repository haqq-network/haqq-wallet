import React, {memo, useEffect} from 'react';

import {View} from 'react-native';

import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {useModal} from '@app/hooks/use-modal';
import {I18N, getText} from '@app/i18n';
import {Wallet} from '@app/models/wallet';
import {
  LedgerStackParamList,
  LedgerStackRoutes,
} from '@app/screens/WelcomeStack/LedgerStack';
import {WalletType} from '@app/types';
import {sleep} from '@app/utils';

export const LedgerStoreWalletScreen = memo(() => {
  const navigation = useTypedNavigation<LedgerStackParamList>();
  const route = useTypedRoute<
    LedgerStackParamList,
    LedgerStackRoutes.LedgerStoreWallet
  >();

  const [show] = useModal();

  useEffect(() => {
    show('loading', {text: getText(I18N.ledgerStoreWalletSaving)});
  }, [show]);

  useEffect(() => {
    setTimeout(() => {
      const actions = [sleep(1000)];

      const lastIndex = route.params.hdPath.split('/').pop() ?? '0';

      actions.push(
        Wallet.create(
          {
            type: WalletType.ledgerBt,
            path: route.params.hdPath,
            address: route.params.address,
            accountId: route?.params?.deviceId,
          },
          `${route?.params?.deviceName} #${lastIndex}`,
        ),
      );

      Promise.all(actions)
        .then(() => {
          navigation.navigate(LedgerStackRoutes.LedgerFinish);
        })
        .catch(error => {
          switch (error) {
            case 'wallet_already_exists':
              show('errorAccountAdded');
              navigation.getParent()?.goBack();
              break;
            default:
              if (error instanceof Error) {
                show('errorCreateAccount');
                navigation.getParent()?.goBack();
                Logger.captureException(
                  error,
                  LedgerStackRoutes.LedgerStoreWallet,
                );
              }
          }
        });
    }, 350);
  }, [navigation, route, show]);

  return <View />;
});
