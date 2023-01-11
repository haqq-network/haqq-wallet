import {useCallback, useEffect, useState} from 'react';

import {ObjectChangeSet} from 'realm';

import {Wallet} from '@app/models/wallet';

export function useWallet(address: string) {
  const [wallet, setWallet] = useState(Wallet.getById(address));

  const updateWallet = useCallback(() => {
    setWallet(Wallet.getById(address));
  }, [address]);

  useEffect(() => {
    updateWallet();
  }, [updateWallet]);

  useEffect(() => {
    if (wallet && wallet.isValid()) {
      const sub = (_: unknown, params: ObjectChangeSet<Wallet>) => {
        if (params.changedProperties.length || params.deleted) {
          updateWallet();
        }
      };

      wallet?.addListener(sub);

      return () => {
        wallet?.removeListener(sub);
      };
    }
  }, [wallet, updateWallet]);

  return wallet;
}
