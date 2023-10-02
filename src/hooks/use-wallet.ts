import {useEffect, useState} from 'react';

import {autorun} from 'mobx';

import {Wallet} from '@app/models/wallet';

export function useWallet(address: string) {
  const [wallet, setWallet] = useState(Wallet.getById(address));

  useEffect(() => {
    const w = Wallet.getById(address);
    autorun(() => {
      setWallet(w);
    });
  }, [address]);

  return wallet;
}
