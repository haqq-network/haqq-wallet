import {useEffect, useState} from 'react';

import {app} from '@app/contexts';
import {Events} from '@app/events';
import {Wallet} from '@app/models/wallet';
import {Balance} from '@app/types';

import {usePrevious} from './use-previous';

export type WalletBalance = {
  [key: string]: Balance | undefined;
};

const getBalance = (wallets: Wallet[] | Realm.Results<Wallet>) => {
  return Object.fromEntries(
    wallets.map(w => [w.address, app.getBalance(w.address)]),
  );
};

export function useWalletsBalance(
  wallets: Wallet[] | Realm.Results<Wallet>,
): WalletBalance {
  const [balance, setBalance] = useState(getBalance(wallets));
  const prevWalletsLength = usePrevious(wallets.length);

  useEffect(() => {
    const onBalance = () => {
      setBalance(getBalance(wallets));
    };

    if (prevWalletsLength !== wallets?.length) {
      onBalance();
    }

    app.on(Events.onBalanceSync, onBalance);
    return () => {
      app.off(Events.onBalanceSync, onBalance);
    };
  }, [prevWalletsLength, wallets]);

  return balance;
}
