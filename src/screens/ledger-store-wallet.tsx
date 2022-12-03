import React, {useEffect} from 'react';

import {View} from 'react-native';

import {captureException, showModal} from '@app/helpers';
import {useTypedNavigation, useTypedRoute, useWallets} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {sleep} from '@app/utils';

export const LedgerStoreWalletScreen = () => {
  const navigation = useTypedNavigation();
  const route = useTypedRoute<'ledgerStore'>();
  const wallets = useWallets();

  useEffect(() => {
    const SAVING = getText(I18N.LedgerStoreWalletSaving);
    showModal('loading', {text: SAVING});
  }, []);

  useEffect(() => {
    setTimeout(() => {
      const actions = [sleep(1000)];

      actions.push(
        wallets.addWalletFromLedger(
          {
            address: route.params.address,
            deviceId: route?.params?.deviceId,
            deviceName: route?.params?.deviceName,
            publicKey: '',
          },
          route?.params?.deviceName,
        ),
      );

      Promise.all(actions)
        .then(() => {
          navigation.navigate('ledgerFinish');
        })
        .catch(error => {
          switch (error) {
            case 'wallet_already_exists':
              showModal('error-account-added');
              navigation.getParent()?.goBack();
              break;
            default:
              if (error instanceof Error) {
                showModal('error-create-account');
                captureException(error, 'ledgerStore');
                navigation.getParent()?.goBack();
              }
          }
        });
    }, 350);
  }, [navigation, route, wallets]);

  return <View />;
};
