import React, {useEffect} from 'react';

import {observer} from 'mobx-react';
import {View} from 'react-native';

import {showModal} from '@app/helpers';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {Wallet} from '@app/models/wallet';
import {LedgerStackParamList, LedgerStackRoutes} from '@app/route-types';
import {ModalType, WalletType} from '@app/types';

export const LedgerStoreWalletScreen = observer(() => {
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
      const lastIndex = Wallet.getAll().filter(
        wallet =>
          wallet.type === WalletType.ledgerBt &&
          wallet.name.includes(route.params.deviceName),
      ).length;

      Wallet.create(`${route?.params?.deviceName} #${lastIndex}`, {
        type: WalletType.ledgerBt,
        path: route.params.hdPath,
        address: route.params.address,
        accountId: route?.params?.deviceId,
      });

      navigation.navigate(LedgerStackRoutes.LedgerFinish);
    }, 350);
  }, [navigation, route]);

  return <View />;
});
