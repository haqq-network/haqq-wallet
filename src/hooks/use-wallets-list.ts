import {useEffect, useState} from 'react';

import {autorun} from 'mobx';

import {Wallet} from '@app/models/wallet';

export function useWalletsList() {
  const [wallets, setWallets] = useState(Wallet.getAll());

  useEffect(() => {
    const ws = Wallet.getAll();
    autorun(() => {
      setWallets(ws);
    });
  }, []);

  return wallets;
}
