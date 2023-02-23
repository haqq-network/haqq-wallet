import React from 'react';

import {groupAllSessionsAccouts} from '@app/utils';

import {useWalletConnectSessions} from './use-wallet-connect-sessions';

export const useWalletConnectAccounts = () => {
  const {activeSessions} = useWalletConnectSessions();

  const accounts = React.useMemo(
    () => groupAllSessionsAccouts(activeSessions),
    [activeSessions],
  );

  return {accounts};
};
