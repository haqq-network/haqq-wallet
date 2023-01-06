import {useEffect, useState} from 'react';

import {Wallet} from '@app/models/wallet';

export function useWallet(address: string) {
  const [, setDate] = useState(new Date());
  const [wallet, setWallet] = useState(Wallet.getById(address));

  useEffect(() => {
    setDate(new Date());
    setWallet(Wallet.getById(address));
  }, [address]);

  useEffect(() => {
    const subscription = () => {
      setDate(new Date());
    };

    wallet?.addListener(subscription);

    return () => {
      wallet?.removeListener(subscription);
    };
  }, [wallet, address]);

  return wallet;
}
