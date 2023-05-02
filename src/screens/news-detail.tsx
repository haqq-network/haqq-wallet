import {useEffect, useMemo} from 'react';

import {NewsDetail} from '@app/components/news-detail';
import {Loading} from '@app/components/ui';
import {trackEvent} from '@app/helpers/track-event';
import {useTypedRoute} from '@app/hooks';
import {News} from '@app/models/news';

export const NewsDetailScreen = () => {
  const route = useTypedRoute<'newsDetail'>();
  const item = useMemo(() => News.getById(route.params.id), [route.params.id]);

  useEffect(() => {
    const startTimestamp = Math.floor(new Date().getTime() / 1000);

    return () => {
      const endTimestamp = Math.floor(new Date().getTime() / 1000);

      trackEvent('news_detail', {
        id: route.params.id,
        duration: endTimestamp - startTimestamp,
      }).finally(() => {
        console.log('event tracked');
      });
    };
  }, [route.params.id]);

  if (!item) {
    return <Loading />;
  }
  return <NewsDetail item={item} />;
};
