import React, {memo, useCallback, useEffect, useState} from 'react';

import {WelcomeNews} from '@app/components/welcome-news';
import {onNewsSync} from '@app/event-actions/on-news-sync';
import {showModal} from '@app/helpers';
import {useTypedNavigation} from '@app/hooks';
import {News} from '@app/models/news';
import {VariablesBool} from '@app/models/variables-bool';
import {WelcomeStackParamList, WelcomeStackRoutes} from '@app/route-types';
import {MarketingEvents, ModalType} from '@app/types';

export const WelcomeNewsScreen = memo(() => {
  const navigation = useTypedNavigation<WelcomeStackParamList>();

  const [news, setNews] = useState(
    News.getAll().filtered('status = "published"').sorted('publishedAt', true),
  );

  useEffect(() => {
    if (!VariablesBool.exists('notifications')) {
      showModal(ModalType.popupNotification);
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
  const onPressHardwareWallet = () =>
    navigation.navigate(WelcomeStackRoutes.Device);
  const onPressSignIn = () => navigation.navigate(WelcomeStackRoutes.SignIn);

  const onPressRow = useCallback(
    (id: string) => {
      navigation.navigate(WelcomeStackRoutes.NewsDetail, {
        id,
        openEvent: MarketingEvents.newsOpenOnboardingItem,
        linkEvent: MarketingEvents.newsOpenOnboardingLink,
        scrollEvent: MarketingEvents.newsScrolledOnboardingItem,
      });
    },
    [navigation],
  );

  return (
    <WelcomeNews
      onPressSignup={onPressSignup}
      onPressHardwareWallet={onPressHardwareWallet}
      onPressSignIn={onPressSignIn}
      news={news}
      onPress={onPressRow}
    />
  );
});
