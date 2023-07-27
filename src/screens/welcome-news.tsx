import React, {useCallback, useEffect, useState} from 'react';

import {WelcomeNews} from '@app/components/welcome-news';
import {onBannerNotificationsTurnOn} from '@app/event-actions/on-banner-notifications-turn-on';
import {onNewsSync} from '@app/event-actions/on-news-sync';
import {useTypedNavigation} from '@app/hooks';
import {News} from '@app/models/news';
import {VariablesBool} from '@app/models/variables-bool';
import {PopupNotificationBannerTypes} from '@app/types';

export const WelcomeNewsScreen = () => {
  const navigation = useTypedNavigation();

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

  const onPressSignup = () => navigation.navigate('signup', {next: 'create'});
  const onPressLedger = () => navigation.navigate('ledger');
  const onPressSignIn = () => navigation.navigate('signin', {next: 'restore'});

  const onPressRow = useCallback(
    (id: string) => {
      navigation.navigate('newsDetail', {
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
};
