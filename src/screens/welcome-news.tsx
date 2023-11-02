import React, {memo, useCallback, useEffect, useState} from 'react';

import {WelcomeNews} from '@app/components/welcome-news';
import {onBannerNotificationsTurnOn} from '@app/event-actions/on-banner-notifications-turn-on';
import {onNewsSync} from '@app/event-actions/on-news-sync';
import {useTypedNavigation} from '@app/hooks';
import {News} from '@app/models/news';
import {VariablesBool} from '@app/models/variables-bool';
import {
  WelcomeStackParamList,
  WelcomeStackRoutes,
} from '@app/screens/WelcomeStack';
import {PopupNotificationBannerTypes} from '@app/types';

export const WelcomeNewsScreen = memo(() => {
  const navigation = useTypedNavigation<WelcomeStackParamList>();

  const [news, setNews] = useState(
    News.getAll().filtered('status = "published"').sorted('publishedAt', true),
  );

  useEffect(() => {
    if (!VariablesBool.exists('notifications')) {
      onBannerNotificationsTurnOn(PopupNotificationBannerTypes.notification);
    }

    onNewsSync().then(() => {
      setNews(
        News.getAll()
          .filtered('status = "published"')
          .sorted('publishedAt', true),
      );
    });
  }, []);

  const onPressSignup = () => navigation.navigate(WelcomeStackRoutes.SignUp);
  const onPressLedger = () => navigation.navigate(WelcomeStackRoutes.Ledger);
  const onPressSignIn = () => navigation.navigate(WelcomeStackRoutes.SignIn);

  const onPressRow = useCallback(
    (id: string) => {
      navigation.navigate(WelcomeStackRoutes.NewsDetail, {
        id,
      });
    },
    [navigation],
  );

  return (
    <WelcomeNews
      onPressSignup={onPressSignup}
      onPressLedger={onPressLedger}
      onPressSignIn={onPressSignIn}
      news={news}
      onPress={onPressRow}
    />
  );
});
