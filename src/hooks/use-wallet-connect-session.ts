import {useEffect, useState} from 'react';

import {SessionTypes} from '@walletconnect/types';

import {usePrevious} from './use-previous';
import {useWalletConnectSessions} from './use-wallet-connect-sessions';

export const useWalletConnectSession = (
  topic: string,
  onDisconnect?: () => void,
) => {
  const {activeSessions} = useWalletConnectSessions();
  const [session, setSession] = useState<SessionTypes.Struct>();
  const prevSession = usePrevious(session);

  useEffect(() => {
    setSession(activeSessions?.find?.(it => it.topic === topic));
  }, [activeSessions, topic, setSession]);

  useEffect(() => {
    if (!session && prevSession) {
      onDisconnect?.();
    }
  }, [onDisconnect, prevSession, session]);

  return session;
};
