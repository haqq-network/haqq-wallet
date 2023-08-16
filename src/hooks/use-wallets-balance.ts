import {useEffect, useState} from 'react';

import {app} from '@app/contexts';
import {Wallet} from '@app/models/wallet';
import {Balance} from '@app/types';

type WalletBalance = {
  [key: string]: Balance;
};

export function useWalletsBalance(
  wallets: Wallet[] | Realm.Results<Wallet>,
): WalletBalance {
  const [balance, setBalance] = useState(
    Object.fromEntries(
      wallets.map(w => [w.address, app.getBalance(w.address)]),
    ),
  );

  useEffect(() => {
    const onBalance = () => {
      setBalance(
        Object.fromEntries(
          wallets.map(w => [w.address, app.getBalance(w.address)]),
        ),
      );
    };

    app.on('balance', onBalance);
    return () => {
      app.off('balance', onBalance);
    };
  }, [wallets]);

  return balance;
}
