import React, {useCallback} from 'react';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {RootStackParamList} from '../types';
import {useWallets} from '../contexts/wallets';
import {LedgerVerify} from '../components/ledger-verify';

export const LedgerVerifyScreen = () => {
  const wallets = useWallets();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'ledgerVerify'>>();

  const onDone = useCallback(
    async (params: {address: string}) => {
      await wallets.addWalletFromLedger(
        {
          address: params.address,
          deviceId: route.params.deviceId,
          deviceName: route.params.deviceName,
        },
        route.params.deviceName,
      );
      navigation.navigate('ledgerFinish', {hide: true});
    },
    [wallets, route.params.deviceId, route.params.deviceName, navigation],
  );

  return (
    <LedgerVerify
      deviceId={route.params.deviceId}
      address={route.params.address}
      onDone={onDone}
    />
  );
};
