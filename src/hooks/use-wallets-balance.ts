import {useEffect, useState} from 'react';

import {app} from '@app/contexts';
import {Events} from '@app/events';
import {Wallet} from '@app/models/wallet';
import {BalanceData, HaqqEthereumAddress} from '@app/types';

import {usePrevious} from './use-previous';

export type WalletBalance = {
  [key: HaqqEthereumAddress]: BalanceData;
};

const getBalance = (wallets: Wallet[]) => {
  return Object.fromEntries(
    wallets.map(w => [w.address, app.getBalanceData(w.address)]),
  );
};

export function useWalletsBalance(wallets: Wallet[]): WalletBalance {
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
