import {useEffect, useState} from 'react';

import {app} from '@app/contexts';
import {Events} from '@app/events';
import {Wallet} from '@app/models/wallet';
import {Balance} from '@app/services/balance';

import {usePrevious} from './use-previous';

export type WalletStakingBalance = {
  [key: string]: Balance | undefined;
};

const getStakingBalance = (wallets: Wallet[] | Realm.Results<Wallet>) => {
  return Object.fromEntries(
    wallets.map(w => [w?.address, app.getStakingBalance(w?.address)]),
  );
};

export function useWalletsStakingBalance(
  wallets: Wallet[] | Realm.Results<Wallet>,
): WalletStakingBalance {
  const [balance, setBalance] = useState(getStakingBalance(wallets));
  const prevWalletsLength = usePrevious(wallets.length);

  useEffect(() => {
    const onBalance = () => {
      setBalance(getStakingBalance(wallets));
    };

    if (prevWalletsLength !== wallets.length) {
      onBalance();
    }

    app.on(Events.onStakingBalanceSync, onBalance);
    return () => {
      app.off(Events.onStakingBalanceSync, onBalance);
    };
  }, [prevWalletsLength, wallets]);

  return balance;
}
