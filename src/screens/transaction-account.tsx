import React, {useCallback, useEffect, useState} from 'react';

import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {FlatList, StyleSheet} from 'react-native';

import {useWallets} from '@app/hooks';

import {PopupContainer} from '../components/ui';
import {WalletRow} from '../components/wallet-row';
import {RootStackParamList} from '../types';

export const TransactionAccountScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'transactionAccount'>>();
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
    <PopupContainer style={styles.container}>
      <FlatList
        data={rows}
        renderItem={({item}) => <WalletRow item={item} onPress={onPressRow} />}
      />
    </PopupContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
  },
});
