import React, {useCallback} from 'react';

import {BrowserHomePage} from '@app/components/browser-home-page';
import {useTypedNavigation} from '@app/hooks';

export const BrowserHomePageScreen = () => {
  const navigation = useTypedNavigation();
  const onSearchPress = useCallback(() => {
    navigation.navigate('browserSearchPage');
  }, [navigation]);

  return <BrowserHomePage onSearchPress={onSearchPress} />;
};
