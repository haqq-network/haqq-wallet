import React, {useCallback} from 'react';

import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

import {LedgerVerify} from '../components/ledger-verify';
import {RootStackParamList} from '../types';

export const LedgerVerifyScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'ledgerVerify'>>();

  const onDone = useCallback(
    (params: {address: string}) => {
      navigation.navigate(route.params.nextScreen ?? 'ledgerStore', {
        address: params.address,
        deviceId: route.params.deviceId,
        deviceName: route.params.deviceName,
      });
    },
    [
      route.params.deviceId,
      route.params.deviceName,
      route.params.nextScreen,
      navigation,
    ],
  );

  return (
    <LedgerVerify
      deviceId={route.params.deviceId}
      address={route.params.address}
      onDone={onDone}
    />
  );
};
