import {FlatList} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import {CompositeScreenProps} from '@react-navigation/native';
import {WalletRow} from '../components/wallet-row';
import {useWallets} from '../contexts/wallets';
import {Container} from '../components/ui';

type TransactionAccountScreenProp = CompositeScreenProps<any, any>;

export const TransactionAccountScreen = ({
  route,
  navigation,
}: TransactionAccountScreenProp) => {
  const wallets = useWallets();
  const onPressRow = useCallback((address: string) => {
    navigation.navigate('transactionAddress', {
      ...route.params,
      from: address,
    });
  }, []);

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

  return (
    <Container>
      <FlatList
        data={rows}
        renderItem={({item}) => <WalletRow item={item} onPress={onPressRow} />}
      />
    </Container>
  );
};
