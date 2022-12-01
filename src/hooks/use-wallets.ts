import {useContext, useEffect, useState} from 'react';

import {WalletsContext} from '@app/contexts';

export function useWallets() {
  const context = useContext(WalletsContext);

  return context;
}

export function useWalletsList() {
  const context = useWallets();

  const [wallets, setWallets] = useState({
    visible: context.visible,
    wallets: context.getWallets?.(),
  });

  useEffect(() => {
    const updateWallets = () => {
      setWallets({visible: context.visible, wallets: context.getWallets()});
    };

    context.on('wallets', updateWallets);

    return () => {
      context.off('wallets', updateWallets);
    };
  }, [context]);

  return wallets;
}
