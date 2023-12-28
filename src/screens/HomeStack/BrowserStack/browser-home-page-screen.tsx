import React, {memo, useCallback, useEffect, useMemo} from 'react';

import {useFocusEffect} from '@react-navigation/native';

import {BrowserHomePage} from '@app/components/browser-home-page';
import {onTrackEvent} from '@app/event-actions/on-track-event';
import {useTypedNavigation} from '@app/hooks';
import {useWeb3BrowserBookmark} from '@app/hooks/use-web3-browser-bookmark';
import {useWeb3BrowserSearchHistory} from '@app/hooks/use-web3-browser-search-history';
import {Web3BrowserBookmark} from '@app/models/web3-browser-bookmark';
import {Web3BrowserSearchHistory} from '@app/models/web3-browser-search-history';
import {
  BrowserStackParamList,
  BrowserStackRoutes,
} from '@app/screens/HomeStack/BrowserStack';
import {RemoteConfig} from '@app/services/remote-config';
import {AdjustEvents, Link} from '@app/types';

export const STRICT_URLS: Partial<Link>[] = [];

export const BrowserHomePageScreen = memo(() => {
  const navigation = useTypedNavigation<BrowserStackParamList>();
  const onSearchPress = useCallback(() => {
    navigation.navigate(BrowserStackRoutes.BrowserSearchPage);
  }, [navigation]);
  const bookmarks = useWeb3BrowserBookmark();
  const searchHistory = useWeb3BrowserSearchHistory();
  const favouriteLinks = useMemo(
    () => bookmarks.toJSON() as unknown as Link[],
    [bookmarks],
  );
  const recentLinks = useMemo(
    () => searchHistory.toJSON() as unknown as Link[],
    [searchHistory],
  );
  const [focused, setFocused] = React.useState(false);

  const onFavouritePress = useCallback(
    (link: Link) => {
      navigation.navigate(BrowserStackRoutes.Web3browser, {url: link.url});
    },
    [navigation],
  );
  const onRecentPress = useCallback(
    (link: Link) => {
      navigation.navigate(BrowserStackRoutes.Web3browser, {url: link.url});
    },
    [navigation],
  );

  const onClearRecentPress = useCallback(() => {
    Web3BrowserSearchHistory.removeAll();
  }, []);
  const onEditFavouritePress = useCallback(() => {
    navigation.navigate(BrowserStackRoutes.BrowserEditBookmarks);
  }, [navigation]);

  useEffect(() => {
    RemoteConfig.awaitForInitialization().then(() => {
      const web3BrowserBookmarks = RemoteConfig.get('web3_browser_bookmarks')!;
      web3BrowserBookmarks.forEach(link => {
        if (!Web3BrowserBookmark.getByUrl(link?.url || '')) {
          Web3BrowserBookmark.create(link);
        }
      });
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => {
        setFocused(false);
      };
    }, [setFocused]),
  );

  useEffect(() => {
    onTrackEvent(AdjustEvents.browserOpen);
  }, []);

  return (
    <BrowserHomePage
      focused={focused}
      favouriteLinks={favouriteLinks}
      recentLinks={recentLinks}
      onSearchPress={onSearchPress}
      onFavouritePress={onFavouritePress}
      onRecentPress={onRecentPress}
      onClearRecentPress={onClearRecentPress}
      onEditFavouritePress={onEditFavouritePress}
    />
  );
});
