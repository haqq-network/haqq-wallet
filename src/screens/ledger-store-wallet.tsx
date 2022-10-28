import React, {useEffect} from 'react';
import {View} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {RootStackParamList} from '../types';
import {useWallets} from '../contexts/wallets';
import {app} from '../contexts/app';
import {sleep} from '../utils';

export const LedgerStoreWalletScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'ledgerStore'>>();
  const wallets = useWallets();

  useEffect(() => {
    app.emit('modal', {type: 'loading', text: 'Wallet saving in progress'});
  }, []);

  useEffect(() => {
    setTimeout(() => {
      const actions = [sleep(1000)];

      actions.push(
        wallets.addWalletFromLedger(
          {
            address: route.params.address,
            deviceId: route.params.deviceId,
            deviceName: route.params.deviceName,
          },
          route.params.deviceName,
        ),
      );

      Promise.all(actions).then(() => {
        navigation.navigate('ledgerFinish');
      });
    }, 350);
  }, [navigation, route, wallets]);

  return <View />;
};
