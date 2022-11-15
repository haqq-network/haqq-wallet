import React, {useCallback, useEffect, useState} from 'react';

import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {FlatList, StyleSheet, View} from 'react-native';

import {useWallets} from '@app/hooks';

import {NoTransactionsIcon, Text} from '../components/ui';
import {WalletRow} from '../components/wallet-row';
import {Wallet} from '../models/wallet';
import {RootStackParamList} from '../types';
import {GRAPHIC_SECOND_3, TEXT_SECOND_1} from '../variables';

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

  if (!rows.length) {
    return (
      <View style={page.emptyContainer}>
        <NoTransactionsIcon color={GRAPHIC_SECOND_3} style={page.space} />
        <Text t14 style={{color: TEXT_SECOND_1}}>
          No wallets
        </Text>
      </View>
    );
  }

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
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '50%',
  },
  space: {marginBottom: 12},
});
