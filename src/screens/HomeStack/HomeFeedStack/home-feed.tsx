import React, {memo, useEffect} from 'react';

import {HomeFeed} from '@app/components/home-feed';
import {app} from '@app/contexts';

export const HomeFeedScreen = memo(() => {
  useEffect(() => {
    app.onboarded = true;
  }, []);

  return <HomeFeed />;
});
