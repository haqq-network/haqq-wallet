import {useEffect, useState} from 'react';

import {wallets} from '@app/contexts';

export function useWallet(address: string) {
  // eslint-disable-next-line  @typescript-eslint/no-unused-vars
  const [_date, setDate] = useState(new Date());
  const [wallet, setWallet] = useState(wallets.getWallet(address));

  useEffect(() => {
    setDate(new Date());
    setWallet(wallets.getWallet(address));
  }, [address]);

  useEffect(() => {
    const subscription = () => {
      setDate(new Date());
    };

    wallet?.on('change', subscription);

    return () => {
      wallet?.off('change', subscription);
    };
  }, [wallet, address]);

  return wallet;
}
