import React, {useCallback, useEffect, useMemo} from 'react';

import {BrowserHomePage} from '@app/components/browser-home-page';
import {useTypedNavigation} from '@app/hooks';
import {useWeb3BrowserBookmark} from '@app/hooks/use-web3-browser-bookmark';
import {useWeb3BrowserSearchHistory} from '@app/hooks/use-web3-browser-search-history';
import {Web3BrowserBookmark} from '@app/models/web3-browser-bookmark';
import {Web3BrowserSearchHistory} from '@app/models/web3-browser-search-history';
import {Link} from '@app/types';

export const STRICT_URLS: Partial<Link>[] = [
  {
    title: 'HAQQ Dashboard',
    url: 'https://app.haqq.network',
    icon: 'https://app.haqq.network/assets/favicon.svg',
  },
  {
    title: 'HAQQ Vesting',
    url: 'https://vesting.haqq.network',
    icon: 'https://vesting.haqq.network/assets/favicon.svg',
  },
];

export const BrowserHomePageScreen = () => {
  const navigation = useTypedNavigation();
  const onSearchPress = useCallback(() => {
    navigation.navigate('browserSearchPage');
  }, [navigation]);
  const bookmarks = useWeb3BrowserBookmark();
  const searchHistory = useWeb3BrowserSearchHistory();
  const favouriteLinks = useMemo(
    () => bookmarks.map(item => item),
    [bookmarks],
  );
  const recentLinks = useMemo(
    () => searchHistory.map(item => item),
    [searchHistory],
  );

  const onFavouritePress = useCallback(
    (link: Link) => {
      navigation.navigate('web3browser', {url: link.url});
    },
    [navigation],
  );
  const onRecentPress = useCallback(
    (link: Link) => {
      navigation.navigate('web3browser', {url: link.url});
    },
    [navigation],
  );

  const onClearRecentPress = useCallback(() => {
    Web3BrowserSearchHistory.removeAll();
  }, []);
  const onEditFavouritePress = useCallback(() => {
    navigation.navigate('browserEditBookmarksScreen');
  }, [navigation]);

  useEffect(() => {
    STRICT_URLS.forEach(link => {
      if (!Web3BrowserBookmark.getByUrl(link?.url || '')) {
        Web3BrowserBookmark.create(link);
      }
    });
  }, []);

  return (
    <BrowserHomePage
      favouriteLinks={favouriteLinks}
      recentLinks={recentLinks}
      onSearchPress={onSearchPress}
      onFavouritePress={onFavouritePress}
      onRecentPress={onRecentPress}
      onClearRecentPress={onClearRecentPress}
      onEditFavouritePress={onEditFavouritePress}
    />
  );
};
