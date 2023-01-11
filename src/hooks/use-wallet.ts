import {useCallback, useEffect, useState} from 'react';

import {Wallet} from '@app/models/wallet';

export function useWallet(address: string) {
  const [wallet, setWallet] = useState(Wallet.getById(address));

  const updateWallet = useCallback(() => {
    setWallet(Wallet.getById(address));
  }, [address]);

  useEffect(() => {
    updateWallet();
  }, [updateWallet]);

  useEffect(() => {
    if (wallet && wallet.isValid()) {
      wallet?.addListener(updateWallet);

      return () => {
        wallet?.removeListener(updateWallet);
      };
    }
  }, [wallet, updateWallet]);

  return wallet;
}
