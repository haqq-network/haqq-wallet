import {useEffect, useState} from 'react';

import {app} from '@app/contexts';
import {Events} from '@app/events';
import {VestingMetadataType} from '@app/models/vesting-metadata';
import {Wallet} from '@app/models/wallet';
import {Balance} from '@app/services/balance';

import {usePrevious} from './use-previous';

export type WalletVestingBalance = {
  [key: string]: Record<VestingMetadataType, Balance> | undefined;
};

const getVestingBalance = (wallets: Wallet[] | Realm.Results<Wallet>) => {
  return Object.fromEntries(
    wallets.map(w => [w.address, app.getVestingBalance(w.address)]),
  );
};

export function useWalletsVestingBalance(
  wallets: Wallet[] | Realm.Results<Wallet>,
): WalletVestingBalance {
  const [balance, setBalance] = useState(getVestingBalance(wallets));
  const prevWalletsLength = usePrevious(wallets.length);

  useEffect(() => {
    const onBalance = () => {
      setBalance(getVestingBalance(wallets));
    };

    if (prevWalletsLength !== wallets.length) {
      onBalance();
    }

    app.on(Events.onVestingBalanceSync, onBalance);
    return () => {
      app.off(Events.onVestingBalanceSync, onBalance);
    };
  }, [prevWalletsLength, wallets]);

  return balance;
}
