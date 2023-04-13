import React, {useCallback} from 'react';

import {BrowserSearchPage} from '@app/components/browser-search-page';
import {useTypedNavigation} from '@app/hooks';
import {useWeb3BrowserSearchHistory} from '@app/hooks/use-web3-browser-search-history';
import {Web3BrowserSearchHistory} from '@app/models/web3-browser-search-history';
import {Link} from '@app/types';

export const BrowserSearchPageScreen = ({}) => {
  const navigation = useTypedNavigation();
  const searchHistory = useWeb3BrowserSearchHistory();

  const onPressCancel = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const onSubmitSearch = useCallback(
    (url: string) => {
      navigation.navigate('web3browser', {url});
    },
    [navigation],
  );

  const onLinkPress = useCallback(
    (link: Link) => {
      navigation.navigate('web3browser', {url: link.url});
    },
    [navigation],
  );

  const onPressClearHistory = useCallback(() => {
    Web3BrowserSearchHistory.removeAll();
  }, []);

  return (
    <BrowserSearchPage
      searchHistory={searchHistory}
      onLinkPress={onLinkPress}
      onPressClearHistory={onPressClearHistory}
      onPressCancel={onPressCancel}
      onSubmitSearch={onSubmitSearch}
    />
  );
};
