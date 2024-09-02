import {useEffect, useState} from 'react';

import {app} from '@app/contexts';
import {Events} from '@app/events';
import {Provider} from '@app/models/provider';
import {Wallet} from '@app/models/wallet';
import {BalanceData, HaqqEthereumAddress} from '@app/types';

import {usePrevious} from './use-previous';

export type WalletBalance = {
  [key: HaqqEthereumAddress]: BalanceData;
};

const getBalance = (wallets: Wallet[]): WalletBalance => {
  return Object.fromEntries(
    wallets.map(w => [w.address, app.getBalanceData(w.address)]),
  ) as WalletBalance;
};

export function useWalletsBalance(wallets: Wallet[]): WalletBalance {
  const [balance, setBalance] = useState<WalletBalance>(getBalance(wallets));
  const prevWalletsLength = usePrevious(wallets.length);

  useEffect(() => {
    const onBalance = () => {
      setBalance(getBalance(wallets));
    };

    if (prevWalletsLength !== wallets?.length) {
      onBalance();
    }

    app.on(Events.onBalanceSync, onBalance);
    app.on(Events.onProviderChangedFinish, onBalance);
    return () => {
      app.off(Events.onBalanceSync, onBalance);
      app.off(Events.onProviderChangedFinish, onBalance);
    };
  }, [prevWalletsLength, wallets]);

  useEffect(() => {
    setBalance(getBalance(wallets));
  }, [Provider.selectedProvider.denom]);

  return balance;
}
