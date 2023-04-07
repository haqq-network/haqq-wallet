import React, {useCallback} from 'react';

import {BrowserSearchPage} from '@app/components/browser-search-page';
import {useTypedNavigation} from '@app/hooks';

export const BrowserSearchPageScreen = ({}) => {
  const navigation = useTypedNavigation();

  const onPressCancel = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return <BrowserSearchPage onPressCancel={onPressCancel} />;
};
