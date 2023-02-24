import {useEffect, useState} from 'react';

import {Wallet} from '@app/models/wallet';

export const useWalletsVisible = () => {
  const [visible, setVisible] = useState(Wallet.getAllVisible().snapshot());
  useEffect(() => {
    const wallets = Wallet.getAllVisible();
    const sub = () => {
      setVisible(wallets.snapshot());
    };

    wallets.addListener(sub);

    return () => {
      wallets.removeListener(sub);
    };
  }, []);

  return visible;
};
