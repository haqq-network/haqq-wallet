import {useEffect, useState} from 'react';

import {Collection, CollectionChangeSet} from 'realm';

import {Wallet} from '@app/models/wallet';

export function useWalletsList() {
  const [wallets, setWallets] = useState(Wallet.getAll().snapshot());

  useEffect(() => {
    const updateWallets = (
      _collection: Collection<Wallet>,
      changes: CollectionChangeSet,
    ) => {
      if (
        changes.deletions.length ||
        changes.insertions.length ||
        changes.newModifications.length ||
        changes.oldModifications.length
      ) {
        setWallets(Wallet.getAll().snapshot());
      }
    };

    Wallet.getAll().addListener(updateWallets);

    return () => {
      Wallet.getAll().addListener(updateWallets);
    };
  }, []);

  return wallets;
}
