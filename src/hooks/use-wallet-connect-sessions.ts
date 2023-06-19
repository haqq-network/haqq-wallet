import {useEffect, useState} from 'react';

import {SessionTypes} from '@walletconnect/types';

import {WalletConnectEvents} from '@app/events';
import {WalletConnect} from '@app/services/wallet-connect';

export const useWalletConnectSessions = () => {
  const [activeSessions, setActiveSessions] = useState<SessionTypes.Struct[]>(
    WalletConnect.instance?.getActiveSessions?.(),
  );

  useEffect(() => {
    WalletConnect.instance.on(
      WalletConnectEvents.onSessionsChange,
      setActiveSessions,
    );

    return () => {
      WalletConnect.instance.removeListener(
        WalletConnectEvents.onSessionsChange,
        setActiveSessions,
      );
    };
  }, [setActiveSessions]);

  return {
    activeSessions,
  };
};
