import React, {useCallback, useEffect, useState} from 'react';

import {Collection, CollectionChangeSet} from 'realm';

import {HomeNews} from '@app/components/home-news';
import {onTrackEvent} from '@app/event-actions/on-track-event';
import {onUpdatesSync} from '@app/event-actions/on-updates-sync';
import {useTypedNavigation} from '@app/hooks';
import {News} from '@app/models/news';
import {RssNews} from '@app/models/rss-news';
import {VariablesBool} from '@app/models/variables-bool';
import {AdjustEvents, NewsStatus, RssNewsStatus} from '@app/types';
import {openInAppBrowser} from '@app/utils';

export const HomeNewsScreen = () => {
  const navigation = useTypedNavigation();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [newsRows, setNewsRows] = useState(
    News.getAll()
      .filtered(`status = "${NewsStatus.published}"`)
      .sorted('createdAt', true)
      .snapshot(),
  );
  const [rssRowsNews, setRssNewsRows] = useState(
    RssNews.getAll()
      .filtered(`status = "${RssNewsStatus.approved}"`)
      .sorted('createdAt', true)
      .snapshot(),
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
        setNewsRows(
          News.getAll()
            .filtered(`status = "${NewsStatus.published}"`)
            .sorted('createdAt', true)
            .snapshot(),
        );
      }
    };

    News.getAll().addListener(onChange);

    return () => {
      News.getAll().removeListener(onChange);
    };
  }, []);

  useEffect(() => {
    VariablesBool.set('isNewRssNews', false);

    const onChange = (
      collection: Collection<RssNews>,
      changes: CollectionChangeSet,
    ) => {
      if (
        changes.insertions.length ||
        changes.newModifications.length ||
        changes.deletions.length
      ) {
        setRssNewsRows(
          RssNews.getAll()
            .filtered(`status = "${RssNewsStatus.approved}"`)
            .sorted('createdAt', true)
            .snapshot(),
        );
      }
    };

    RssNews.getAll().addListener(onChange);

    return () => {
      RssNews.getAll().removeListener(onChange);
    };
  }, []);

  const onPressOurNews = useCallback(
    (id: string) => {
      navigation.navigate('newsDetail', {
        id,
      });
    },
    [navigation],
  );

  const onPressCryptoNews = useCallback((id: string) => {
    const rssNews = RssNews.getById(id);
    if (rssNews instanceof RssNews) {
      openInAppBrowser(rssNews.url, {
        onPageLoaded: () => {
          if (!rssNews.viewed) {
            rssNews.update({
              viewed: true,
            });
          }
        },
      });
    }
  }, []);

  const onPressViewAll = useCallback(() => {
    navigation.navigate('ourNews');
  }, [navigation]);

  const onRefresh = useCallback(async () => {
    try {
      setIsRefreshing(true);
      await onUpdatesSync();
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  return (
    <HomeNews
      onRefresh={onRefresh}
      refreshing={isRefreshing}
      cryptoNews={rssRowsNews}
      // cryptoNews={[...rssRowsNews, ...rssRowsNews, ...rssRowsNews, ...rssRowsNews, ...rssRowsNews ,...rssRowsNews, ...rssRowsNews, ...rssRowsNews, ...rssRowsNews, ...rssRowsNews, ...rssRowsNews]}
      ourNews={newsRows}
      onPressCryptoNews={onPressCryptoNews}
      onPressOurNews={onPressOurNews}
      onPressViewAll={onPressViewAll}
    />
  );
};
