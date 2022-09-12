import React, {useCallback} from 'react';
import {Container} from '../components/container';
import {useWallets} from '../contexts/wallets';
import {FlatList} from 'react-native';
import {WalletRow} from '../components/wallet-row';
import {Wallet} from '../models/wallet';
import {CompositeScreenProps} from '@react-navigation/native';

type SettingsAccountsScreenProps = CompositeScreenProps<any, any>;

export const SettingsAccountsScreen = ({
  navigation,
}: SettingsAccountsScreenProps) => {
  const wallets = useWallets();
  const onPressRow = useCallback(
    (address: string) => {
      navigation.navigate('settingsAccountDetail', {
        address,
      });
    },
    [navigation],
  );
  return (
    <Container>
      <FlatList
        data={wallets.getWallets()}
        renderItem={({item}) => <WalletRow item={item} onPress={onPressRow} />}
        keyExtractor={(wallet: Wallet) => wallet.address}
      />
    </Container>
  );
};
