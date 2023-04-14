import {useEffect, useState} from 'react';

import {Web3BrowserBookmark} from '@app/models/web3-browser-bookmark';

export const useWeb3BrowserBookmark = () => {
  const [values, setValues] = useState(Web3BrowserBookmark.getAll().snapshot());
  useEffect(() => {
    const bookmarks = Web3BrowserBookmark.getAll();
    const sub = () => {
      setValues(bookmarks.snapshot());
    };

    bookmarks.addListener(sub);

    return () => {
      bookmarks.removeListener(sub);
    };
  }, []);

  return values;
};
