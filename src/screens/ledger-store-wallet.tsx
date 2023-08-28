import React, {useEffect} from 'react';

import {View} from 'react-native';

import {showModal} from '@app/helpers';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {Wallet} from '@app/models/wallet';
import {WalletType} from '@app/types';
import {sleep} from '@app/utils';

export const LedgerStoreWalletScreen = () => {
  const navigation = useTypedNavigation();
  const route = useTypedRoute<'ledgerStore'>();

  useEffect(() => {
    showModal('loading', {text: getText(I18N.ledgerStoreWalletSaving)});
  }, []);

  useEffect(() => {
    setTimeout(() => {
      const actions = [sleep(1000)];

      const lastIndex = route.params.hdPath.split('/').pop() ?? '0';

      actions.push(
        Wallet.create(
          {
            type: WalletType.ledgerBt,
            path: route.params.hdPath,
            address: route.params?.address,
            accountId: route?.params?.deviceId,
          },
          `${route?.params?.deviceName} #${lastIndex}`,
        ),
      );

      Promise.all(actions)
        .then(() => {
          navigation.navigate('ledgerFinish');
        })
        .catch(error => {
          switch (error) {
            case 'wallet_already_exists':
              showModal('errorAccountAdded');
              navigation.getParent()?.goBack();
              break;
            default:
              if (error instanceof Error) {
                showModal('errorCreateAccount');
                navigation.getParent()?.goBack();
                Logger.captureException(error, 'ledgerStore');
              }
          }
        });
    }, 350);
  }, [navigation, route]);

  return <View />;
};
