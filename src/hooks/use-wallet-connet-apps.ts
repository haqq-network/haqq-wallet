import {useEffect, useState} from 'react';

import {WalletConnectApplication} from '@app/types';
import {getConnectedAppsByAddress} from '@app/utils';

import {useWalletConnectSessions} from './use-wallet-connect-sessions';

export const useWalletConnectApps = (address: string) => {
  const {activeSessions} = useWalletConnectSessions();
  const [apps, setApps] = useState<WalletConnectApplication[]>([]);

  useEffect(() => {
    const appsList = getConnectedAppsByAddress(activeSessions, address);
    setApps(appsList);
  }, [activeSessions, address, setApps]);

  return apps;
};
