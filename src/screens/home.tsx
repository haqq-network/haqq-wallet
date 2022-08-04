import React, {useCallback, useEffect, useState} from 'react';
import {CompositeScreenProps} from '@react-navigation/native';
import {Button, Text, View} from 'react-native';
import {useWallets} from '../contexts/wallets';
import {Balance} from '../components/balance';

type HomeScreenProp = CompositeScreenProps<any, any>;

export const HomeScreen = ({navigation}: HomeScreenProp) => {
  const wallet = useWallets();
  const [wallets, setWallets] = useState(wallet.getWallets());

  const updateWallets = useCallback(() => {
    setWallets(wallet.getWallets());
  }, [wallet]);

  useEffect(() => {
    wallet.on('wallets', updateWallets);

    return () => {
      wallet.off('wallets', updateWallets);
    };
  }, [wallet]);

  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Text>Home Screen</Text>
      {wallets.map(w => (
        <Balance wallet={w} key={w.address} />
      ))}
      <Button
        title="Import wallet"
        onPress={() => navigation.navigate('import-wallet')}
      />
      <Button
        title="Logout"
        onPress={() => {
          wallet.clean().then(() => {
            navigation.navigate('login');
          });
        }}
      />
    </View>
  );
};
