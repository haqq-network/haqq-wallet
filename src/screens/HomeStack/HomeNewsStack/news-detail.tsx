import {memo, useEffect, useMemo} from 'react';

import {NewsDetail} from '@app/components/news-detail';
import {Loading} from '@app/components/ui';
import {trackEvent} from '@app/helpers/track-event';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {News} from '@app/models/news';
import {
  WelcomeStackParamList,
  WelcomeStackRoutes,
} from '@app/screens/WelcomeStack';

export const NewsDetailScreen = memo(() => {
  const navigation = useTypedNavigation<WelcomeStackParamList>();
  const route = useTypedRoute<
    WelcomeStackParamList,
    WelcomeStackRoutes.NewsDetail
  >();
  const item = useMemo(() => News.getById(route.params.id), [route.params.id]);

  useEffect(() => {
    if (item?.title) {
      navigation.setOptions({title: item?.title});
    }
  }, []);

  useEffect(() => {
    const row = News.getById(route.params.id);
    if (row && !row.viewed) {
      row.update({
        viewed: true,
      });
    }

    const startTimestamp = Math.floor(new Date().getTime() / 1000);

    return () => {
      const endTimestamp = Math.floor(new Date().getTime() / 1000);

      trackEvent('news_detail', {
        id: route.params.id,
        duration: endTimestamp - startTimestamp,
      }).finally(() => {
        Logger.log('event tracked');
      });
    };
  }, [route.params.id]);

  if (!item) {
    return <Loading />;
  }
  return (
    <NewsDetail
      item={item}
      openEvent={route.params.openEvent}
      linkEvent={route.params.linkEvent}
      scrollEvent={route.params.scrollEvent}
    />
  );
});
