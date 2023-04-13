import {useEffect, useState} from 'react';

import {Web3BrowserSession} from '@app/models/web3-browser-session';

export const useWeb3BrowserSessions = () => {
  const [values, setValues] = useState(Web3BrowserSession.getAll().snapshot());
  useEffect(() => {
    const sessions = Web3BrowserSession.getAll();
    const sub = () => {
      setValues(sessions.snapshot());
    };

    sessions.addListener(sub);

    return () => {
      sessions.removeListener(sub);
    };
  }, []);

  return values;
};
