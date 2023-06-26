import React, {useCallback, useEffect, useState} from 'react';

import {WelcomeNews} from '@app/components/welcome-news';
import {onNewsSync} from '@app/event-actions/on-news-sync';
import {useTypedNavigation} from '@app/hooks';
import {News} from '@app/models/news';
import {VariablesBool} from '@app/models/variables-bool';
import {PushNotifications} from '@app/services/push-notifications';

export const WelcomeNewsScreen = () => {
  const navigation = useTypedNavigation();

  const [news, setNews] = useState(
    News.getAll().filtered('status = "published"').sorted('publishedAt', true),
  );

  useEffect(() => {
    if (!VariablesBool.exists('notifications')) {
      PushNotifications.instance
        .requestPermissions()
        .then(() => {
          VariablesBool.set('notifications', true);
        })
        .catch(() => {
          VariablesBool.set('notifications', false);
        });
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
