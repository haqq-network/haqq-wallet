import {useEffect, useState} from 'react';

import {SessionTypes} from '@walletconnect/types';

import {filterWalletConnectSessionsByAddress} from '@app/utils';

import {useWalletConnectSessions} from './use-wallet-connect-sessions';

export const useWalletConnectFilteredSessions = (address: string) => {
  const {activeSessions} = useWalletConnectSessions();
  const [apps, setApps] = useState<SessionTypes.Struct[]>();

  useEffect(() => {
    const appsList = filterWalletConnectSessionsByAddress(
      activeSessions,
      address,
    );
    setApps(appsList);
  }, [activeSessions, address, setApps]);

  return apps;
};
