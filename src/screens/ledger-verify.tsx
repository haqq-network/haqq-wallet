import React, {useCallback, useContext} from 'react';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {RootStackParamList} from '../types';
import {useWallets} from '../contexts/wallets';
import {LedgerVerify} from '../components/ledger-verify';
import {LedgerContext} from '../contexts/ledger';

export const LedgerVerifyScreen = () => {
  const ledgerService = useContext(LedgerContext);
  const wallets = useWallets();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'ledgerVerify'>>();

  const onDone = useCallback(
    async (params: {address: string; deviceId: string; deviceName: string}) => {
      await wallets.addWalletFromLedger(params, params.deviceName);
      navigation.navigate('ledgerFinish', {hide: true});
    },
    [wallets, navigation],
  );

  return (
    <LedgerVerify
      address={route.params.address}
      onDone={onDone}
      ledgerService={ledgerService}
    />
  );
};
