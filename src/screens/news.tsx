import {useCallback, useEffect, useState} from 'react';

import {Collection, CollectionChangeSet} from 'realm';

import {News as NewsComponent} from '@app/components/news';
import {app} from '@app/contexts';
import {useTypedNavigation} from '@app/hooks';
import {News} from '@app/models/news';

export const NewsScreen = () => {
  const navigation = useTypedNavigation();
  const [rows, setRows] = useState(News.getAll().snapshot());
  useEffect(() => {
    app.getUser().isNewNews = false;

    const onChange = (
      collection: Collection<News>,
      changes: CollectionChangeSet,
    ) => {
      if (
        changes.insertions.length ||
        changes.newModifications.length ||
        changes.deletions.length
      ) {
        setRows(News.getAll().snapshot());
      }
    };

    News.getAll().addListener(onChange);

    return () => {
      News.getAll().removeListener(onChange);
    };
  }, []);

  const onPressRow = useCallback(
    (id: string) => {
      navigation.navigate('newsDetail', {
        id,
      });
    },
    [navigation],
  );

  return <NewsComponent rows={rows} onPress={onPressRow} />;
};
