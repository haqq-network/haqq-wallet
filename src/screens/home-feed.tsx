import React, {useCallback, useEffect, useState} from 'react';
import {CompositeScreenProps} from '@react-navigation/native';
import {Button, SafeAreaView, Text} from 'react-native';
import {useWallets} from '../contexts/wallets';
import {Balance} from '../components/balance';
import {Spacer} from '../components/spacer';
import {Container} from '../components/container';

type HomeFeedScreenProp = CompositeScreenProps<any, any>;

export const HomeFeedScreen = ({navigation}: HomeFeedScreenProp) => {
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
    <Container>
      {wallets.map(w => (
        <Balance wallet={w} key={w.address} />
      ))}
      <Button title="Scan qr" onPress={() => navigation.navigate('scan-qr')} />
      <Button
        title="Import wallet"
        onPress={() => navigation.navigate('import-wallet')}
      />
    </Container>
  );
};
