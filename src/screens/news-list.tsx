import {useCallback, useEffect, useState} from 'react';

import {Collection, CollectionChangeSet} from 'realm';

import {NewsRowList} from '@app/components/news';
import {useTypedNavigation} from '@app/hooks';
import {News} from '@app/models/news';
import {VariablesBool} from '@app/models/variables-bool';
import {EventTracker} from '@app/services/event-tracker';
import {MarketingEvents} from '@app/types';

export const NewsListScreen = () => {
  const navigation = useTypedNavigation();
  const [rows, setRows] = useState(
    News.getAll()
      .filtered('status = "published"')
      .sorted('publishedAt', true)
      .snapshot(),
  );

  useEffect(() => {
    EventTracker.instance.trackEvent(MarketingEvents.newsOpen);
  }, []);

  useEffect(() => {
    VariablesBool.set('isNewNews', false);

    const onChange = (
      collection: Collection<News>,
      changes: CollectionChangeSet,
    ) => {
      if (
        changes.insertions.length ||
        changes.newModifications.length ||
        changes.deletions.length
      ) {
        setRows(
          News.getAll()
            .filtered('status = "published"')
            .sorted('publishedAt', true)
            .snapshot(),
        );
      }
    };

    News.getAll().addListener(onChange);

    return () => {
      News.getAll().removeListener(onChange);
    };
  }, []);

  const onPressRow = useCallback(
    (id: string) => {
      navigation.push('newsDetail', {
        id,
      });
    },
    [navigation],
  );

  return <NewsRowList data={rows} onPress={onPressRow} />;
};
