import React, {useCallback, useEffect, useState} from 'react';
import {StyleSheet, FlatList} from 'react-native';
import {useWallets} from '../contexts/wallets';
import {WalletRow} from '../components/wallet-row';
import {Wallet} from '../models/wallet';
import {StackNavigationProp} from '@react-navigation/stack';
import {useNavigation} from '@react-navigation/native';
import {RootStackParamList} from '../types';

export const SettingsAccountsScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const wallets = useWallets();
  const [rows, setRows] = useState(wallets.getWallets());

  useEffect(() => {
    setRows(wallets.getWallets());

    const callback = () => {
      setRows(wallets.getWallets());
    };

    wallets.on('wallets', callback);
    return () => {
      wallets.off('wallets', callback);
    };
  }, [wallets]);

  const onPressRow = useCallback(
    (address: string) => {
      navigation.navigate('settingsAccountDetail', {
        address,
      });
    },
    [navigation],
  );
  return (
    <FlatList
      data={rows}
      renderItem={({item}) => <WalletRow item={item} onPress={onPressRow} />}
      keyExtractor={(wallet: Wallet) => wallet.address}
      style={page.container}
    />
  );
};

const page = StyleSheet.create({
  container: {paddingHorizontal: 20, flex: 1},
});
