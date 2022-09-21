import React, {useCallback, useEffect, useState} from 'react';
import {useWallets} from '../contexts/wallets';
import {FlatList} from 'react-native';
import {WalletRow} from '../components/wallet-row';
import {Wallet} from '../models/wallet';
import {CompositeScreenProps} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

type SettingsAccountsScreenProps = CompositeScreenProps<any, any>;

export const SettingsAccountsScreen = ({
  navigation,
}: SettingsAccountsScreenProps) => {
  const wallets = useWallets();
  const [rows, setRows] = useState(wallets.getWallets());
  const insets = useSafeAreaInsets();

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
      style={{paddingHorizontal: 20, flex: 1}}
    />
  );
};
