import React, {memo, useCallback, useEffect, useMemo} from 'react';

import {useFocusEffect} from '@react-navigation/native';

import {BrowserHomePage} from '@app/components/browser-home-page';
import {useTypedNavigation} from '@app/hooks';
import {useWeb3BrowserBookmark} from '@app/hooks/use-web3-browser-bookmark';
import {useWeb3BrowserSearchHistory} from '@app/hooks/use-web3-browser-search-history';
import {Web3BrowserBookmark} from '@app/models/web3-browser-bookmark';
import {Web3BrowserSearchHistory} from '@app/models/web3-browser-search-history';
import {BrowserStackParamList, BrowserStackRoutes} from '@app/route-types';
import {EventTracker} from '@app/services/event-tracker';
import {RemoteConfig} from '@app/services/remote-config';
import {Link, MarketingEvents} from '@app/types';

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
      if (link.eventName) {
        EventTracker.instance.trackEvent(link.eventName as MarketingEvents);
      }
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
        const savedLink = Web3BrowserBookmark.getByUrl(link?.url || '');
        if (!savedLink) {
          Web3BrowserBookmark.create(link);
        } else {
          savedLink.update(link);
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
    EventTracker.instance.trackEvent(MarketingEvents.browserOpen);
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
