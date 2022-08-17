import {useWallets} from '../contexts/wallets';
import React, {useCallback, useEffect, useState} from 'react';
import {WalletCard} from './wallet-card';

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

  return <WalletCard wallet={wallets[0]} />;
};
