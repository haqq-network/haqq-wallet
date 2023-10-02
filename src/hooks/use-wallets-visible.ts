import {useEffect, useState} from 'react';

import {autorun} from 'mobx';

import {Wallet} from '@app/models/wallet';

export const useWalletsVisible = () => {
  const [visible, setVisible] = useState(Wallet.getAllVisible());

  useEffect(() => {
    const wallets = Wallet.getAllVisible();

    autorun(() => {
      setVisible(wallets);
    });
  }, []);

  return visible;
};
