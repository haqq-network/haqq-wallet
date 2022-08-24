import {useWallets} from '../contexts/wallets';
import React, {useCallback, useEffect, useState} from 'react';
import {WalletCard} from './wallet-card';
import {H2} from './ui';
import {View} from 'react-native';

export const Wallets = () => {
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

  if (!wallets.length) {
    return null;
  }

  return (
    <>
      <View style={{marginBottom: 24}}>
        <WalletCard wallet={wallets[0]} />
      </View>
      <H2 style={{marginVertical: 12, textAlign: 'left'}}>Transactions</H2>
    </>
  );
};
