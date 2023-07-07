import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {Collection, CollectionChangeSet} from 'realm';

import {HomeNews} from '@app/components/home-news';
import {onRssFeedSync} from '@app/event-actions/on-rss-feed-sync';
import {onTrackEvent} from '@app/event-actions/on-track-event';
import {onUpdatesSync} from '@app/event-actions/on-updates-sync';
import {useTypedNavigation} from '@app/hooks';
import {News} from '@app/models/news';
import {RssNews} from '@app/models/rss-news';
import {VariablesBool} from '@app/models/variables-bool';
import {AdjustEvents, NewsStatus, RssNewsStatus} from '@app/types';
import {openInAppBrowser} from '@app/utils';

const RSS_FEED_ITEMS_PAGE_LIMIT = 15;
const NEWS_ITEMS_LIMIT = 10;

export const HomeNewsScreen = () => {
  const navigation = useTypedNavigation();
  const [isRefreshing, setRefreshing] = useState(false);
  const [isRssRefreshing, setRssRefreshing] = useState(false);
  const [rssPage, setRssPage] = useState(1);
  const [newsRows, setNewsRows] = useState(
    News.getAll()
      .filtered(`status = "${NewsStatus.published}"`)
      .sorted('createdAt', true)
      .snapshot()
      .slice(0, NEWS_ITEMS_LIMIT),
  );
  const [rssRowsNews, setRssNewsRows] = useState(
    RssNews.getAll()
      .filtered(`status = "${RssNewsStatus.approved}"`)
      .sorted('createdAt', true)
      .snapshot(),
  );
  const trimmedRssRowsNews = useMemo(
    () => rssRowsNews.slice(0, RSS_FEED_ITEMS_PAGE_LIMIT * rssPage),
    [rssPage, rssRowsNews],
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
            .snapshot()
            .slice(0, NEWS_ITEMS_LIMIT),
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
      setRefreshing(true);
      await onUpdatesSync();
    } finally {
      setRefreshing(false);
    }
  }, []);

  const onEndReached = useCallback(async () => {
    try {
      const lastRssPageItems = rssRowsNews.slice(
        (rssPage - 1) * RSS_FEED_ITEMS_PAGE_LIMIT,
      );

      if (
        lastRssPageItems.length < RSS_FEED_ITEMS_PAGE_LIMIT ||
        rssRowsNews.length < RSS_FEED_ITEMS_PAGE_LIMIT * rssPage
      ) {
        setRssRefreshing(true);
        const lastItem = rssRowsNews[rssRowsNews.length - 1];
        await onRssFeedSync(lastItem.updatedAt);
      }
      setRssPage(prev => prev + 1);
    } finally {
      setRssRefreshing(false);
    }
  }, [rssPage, rssRowsNews]);

  return (
    <HomeNews
      ourNews={newsRows}
      cryptoNews={trimmedRssRowsNews}
      refreshing={isRefreshing}
      rssRefreshing={isRssRefreshing}
      onRefresh={onRefresh}
      onEndReached={onEndReached}
      onPressOurNews={onPressOurNews}
      onPressViewAll={onPressViewAll}
      onPressCryptoNews={onPressCryptoNews}
    />
  );
};
