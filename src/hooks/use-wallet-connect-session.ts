import {useEffect, useState} from 'react';

import {SessionTypes} from '@walletconnect/types';

import {useWalletConnectSessions} from './use-wallet-connect-sessions';

export const useWalletConnectSession = (topic: string) => {
  const {activeSessions} = useWalletConnectSessions();
  const [session, setSession] = useState<SessionTypes.Struct>();

  useEffect(() => {
    setSession(activeSessions?.find?.(it => it.topic === topic));
  }, [activeSessions, topic, setSession]);

  return session;
};
