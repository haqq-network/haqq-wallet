import React, {useCallback, useEffect, useState} from 'react';
import {CompositeScreenProps} from '@react-navigation/native';
import {Button} from 'react-native';
import {useWallets} from '../contexts/wallets';
import {WalletCard} from '../components/wallet-card';
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
        <WalletCard wallet={w} key={w.address} />
      ))}
      <Button
        title="Import wallet"
        onPress={() => navigation.navigate('import-wallet')}
      />
    </Container>
  );
};
