import React, {memo, useEffect} from 'react';

import {HomeFeed} from '@app/components/home-feed';
import {AppStore} from '@app/models/app';

export const HomeFeedScreen = memo(() => {
  useEffect(() => {
    AppStore.isOnboarded = true;
  }, []);

  return <HomeFeed />;
});
