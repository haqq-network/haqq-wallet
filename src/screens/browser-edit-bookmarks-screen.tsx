import React, {useCallback, useEffect, useState} from 'react';

import {BrowserEditBookmarks} from '@app/components/browser-edit-bookmarks';
// import {useTypedNavigation} from '@app/hooks';
import {useWeb3BrowserBookmark} from '@app/hooks/use-web3-browser-bookmark';
import {Web3BrowserBookmark} from '@app/models/web3-browser-bookmark';
import {Link} from '@app/types';

export const BrowserEditBookmarksScreen = () => {
  // const navigation = useTypedNavigation();

  const bookmarks = useWeb3BrowserBookmark();
  const [links, setLinks] = useState<Link[]>(bookmarks.map(item => item));

  useEffect(() => {
    setLinks(bookmarks.map(item => item));
  }, [bookmarks]);

  const onDragEnd = useCallback((newLinks: Link[]) => {
    setLinks(newLinks);
  }, []);

  const onPressRemove = useCallback((link: Link) => {
    Web3BrowserBookmark.remove(link.id);
  }, []);

  return (
    <BrowserEditBookmarks
      links={links}
      onPressRemove={onPressRemove}
      onDragEnd={onDragEnd}
    />
  );
};
