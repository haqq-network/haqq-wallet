import {useEffect, useState} from 'react';

import {Web3BrowserSearchHistory} from '@app/models/web3-browser-search-history';

export const useWeb3BrowserSearchHistory = () => {
  const [values, setValues] = useState(
    Web3BrowserSearchHistory.getAll().snapshot(),
  );
  useEffect(() => {
    const searchHistory = Web3BrowserSearchHistory.getAll();
    const sub = () => {
      setValues(searchHistory.snapshot());
    };

    searchHistory.addListener(sub);

    return () => {
      searchHistory.removeListener(sub);
    };
  }, []);

  return values;
};
