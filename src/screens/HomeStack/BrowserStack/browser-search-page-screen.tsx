import React, {memo, useCallback} from 'react';

import {BrowserSearchPage} from '@app/components/browser-search-page';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {useWeb3BrowserSearchHistory} from '@app/hooks/use-web3-browser-search-history';
import {Web3BrowserSearchHistory} from '@app/models/web3-browser-search-history';
import {
  BrowserStackParamList,
  BrowserStackRoutes,
} from '@app/screens/HomeStack/BrowserStack';
import {Link} from '@app/types';

export const BrowserSearchPageScreen = memo(() => {
  const navigation = useTypedNavigation<BrowserStackParamList>();
  const {initialSearchText} =
    useTypedRoute<BrowserStackParamList, BrowserStackRoutes.BrowserSearchPage>()
      .params || {};
  const searchHistory = useWeb3BrowserSearchHistory();

  const onPressCancel = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const onSubmitSearch = useCallback(
    (url: string) => {
      navigation.navigate(BrowserStackRoutes.Web3browser, {url});
    },
    [navigation],
  );

  const onLinkPress = useCallback(
    (link: Link) => {
      navigation.navigate(BrowserStackRoutes.Web3browser, {url: link.url});
    },
    [navigation],
  );

  const onPressClearHistory = useCallback(() => {
    Web3BrowserSearchHistory.removeAll();
  }, []);

  return (
    <BrowserSearchPage
      initialSearchText={initialSearchText}
      searchHistory={searchHistory}
      onLinkPress={onLinkPress}
      onPressClearHistory={onPressClearHistory}
      onPressCancel={onPressCancel}
      onSubmitSearch={onSubmitSearch}
    />
  );
});
