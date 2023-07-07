import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {Collection, CollectionChangeSet} from 'realm';

import {OurNews} from '@app/components/our-news';
import {onNewsSync} from '@app/event-actions/on-news-sync';
import {onTrackEvent} from '@app/event-actions/on-track-event';
import {useTypedNavigation} from '@app/hooks';
import {News} from '@app/models/news';
import {VariablesBool} from '@app/models/variables-bool';
import {AdjustEvents} from '@app/types';

const NEWS_ITEMS_PAGE_LIMIT = 15;

export const OurNewsScreen = () => {
  const navigation = useTypedNavigation();
  const [isRefreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);

  const [rows, setRows] = useState(
    News.getAll()
      .filtered('status = "published"')
      .sorted('publishedAt', true)
      .snapshot(),
  );

  const trimmedRowsNews = useMemo(
    () => rows.slice(0, NEWS_ITEMS_PAGE_LIMIT * page),
    [page, rows],
  );

  useEffect(() => {
    onTrackEvent(AdjustEvents.newsOpen);
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
      navigation.navigate('newsDetail', {
        id,
      });
    },
    [navigation],
  );

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await onNewsSync();
    } finally {
      setRefreshing(false);
    }
  }, []);

  const onEndReached = useCallback(async () => {
    setPage(prev => prev + 1);
  }, []);

  return (
    <OurNews
      data={trimmedRowsNews}
      refreshing={isRefreshing}
      onPress={onPressRow}
      onRefresh={onRefresh}
      onEndReached={onEndReached}
    />
  );
};
