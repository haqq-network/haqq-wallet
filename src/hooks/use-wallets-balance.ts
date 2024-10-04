import {useEffect, useState} from 'react';

import {app} from '@app/contexts';
import {Events} from '@app/events';
import {Provider} from '@app/models/provider';
import {WalletModel} from '@app/models/wallet';
import {BalanceData, HaqqEthereumAddress} from '@app/types';

export type WalletBalance = {
  [key: HaqqEthereumAddress]: BalanceData;
};

const getBalance = (wallets: WalletModel[]): WalletBalance => {
  return Object.fromEntries(
    wallets.map(w => {
      return [w.address, app.getBalanceData(w.address)];
    }),
  ) as WalletBalance;
};

export function useWalletsBalance(wallets: WalletModel[]): WalletBalance {
  const [balance, setBalance] = useState<WalletBalance>(getBalance(wallets));

  useEffect(() => {
    const onBalance = () => {
      setBalance(getBalance(wallets));
    };

    onBalance();

    app.on(Events.onBalanceSync, onBalance);
    return () => {
      app.off(Events.onBalanceSync, onBalance);
    };
  }, [wallets, wallets?.length, Provider.selectedProviderId]);

  useEffect(() => {
    setBalance(getBalance(wallets));
  }, [Provider.selectedProvider.denom]);

  return balance;
}
