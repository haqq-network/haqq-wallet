import React, {useCallback, useEffect, useState} from 'react';
import {CompositeScreenProps} from '@react-navigation/native';
import {Button, SafeAreaView, Text, View} from 'react-native';
import {useWallets} from '../contexts/wallets';
import {Balance} from '../components/balance';
import {Spacer} from '../components/spacer';

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
  }, [updateWallets, wallet]);

  return (
    <SafeAreaView
      style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Text>Home Screen</Text>
      {wallets.map(w => (
        <Balance wallet={w} key={w.address} />
      ))}
      <Button title="Scan qr" onPress={() => navigation.navigate('scan-qr')} />
      <Button
        title="Import wallet"
        onPress={() => navigation.navigate('import-wallet')}
      />
      <Spacer />
      <Button
        title="Settings"
        onPress={() => navigation.navigate('settings')}
      />
    </SafeAreaView>
  );
};
