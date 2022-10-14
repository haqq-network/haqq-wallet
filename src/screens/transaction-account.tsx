import React, {useCallback, useEffect, useState} from 'react';
import {FlatList} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {RootStackParamList} from '../types';
import {WalletRow} from '../components/wallet-row';
import {useWallets} from '../contexts/wallets';
import {Container} from '../components/ui';

type ParamList = {
  transactionAccount: {};
};

export const TransactionAccountScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<ParamList, 'transactionAccount'>>();
  const wallets = useWallets();
  const onPressRow = useCallback(
    (address: string) => {
      navigation.navigate('transactionAddress', {
        ...route.params,
        from: address,
      });
    },
    [navigation, route.params],
  );

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
