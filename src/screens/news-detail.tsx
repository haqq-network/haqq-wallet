import {useMemo} from 'react';

import {NewsDetail} from '@app/components/news-detail';
import {Loading} from '@app/components/ui';
import {useTypedRoute} from '@app/hooks';
import {News} from '@app/models/news';

export const NewsDetailScreen = () => {
  const route = useTypedRoute<'newsDetail'>();
  const item = useMemo(() => News.getById(route.params.id), [route.params.id]);
  if (!item) {
    return <Loading />;
  }
  return <NewsDetail item={item} />;
};
