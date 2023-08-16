import React, {memo, useCallback, useEffect, useMemo, useState} from 'react';

import {Collection, CollectionChangeSet} from 'realm';

import {HomeNews} from '@app/components/home-news';
import {onRssFeedSync} from '@app/event-actions/on-rss-feed-sync';
import {onTrackEvent} from '@app/event-actions/on-track-event';
import {onUpdatesSync} from '@app/event-actions/on-updates-sync';
import {useTypedNavigation} from '@app/hooks';
import {News} from '@app/models/news';
import {RssNews} from '@app/models/rss-news';
import {VariablesBool} from '@app/models/variables-bool';
import {
  NewsStackParamList,
  NewsStackRoutes,
} from '@app/screens/HomeStack/HomeNewsStack';
import {AdjustEvents, NewsStatus} from '@app/types';
import {openInAppBrowser} from '@app/utils';

const RSS_FEED_ITEMS_PAGE_LIMIT = 15;
const NEWS_ITEMS_LIMIT = 10;

export const HomeNewsScreen = memo(() => {
  const navigation = useTypedNavigation<NewsStackParamList>();
  const [isRefreshing, setRefreshing] = useState(false);
  const [isRssRefreshing, setRssRefreshing] = useState(false);
  const [canLoadNext, setCanLoadNext] = useState(true);
  const [newsRows, setNewsRows] = useState(
    News.getAll()
      .filtered(`status = "${NewsStatus.published}"`)
      .sorted('createdAt', true)
      .snapshot()
      .slice(0, NEWS_ITEMS_LIMIT),
  );
  const [rssRowsNews, setRssNewsRows] = useState(
    RssNews.getAllApprovedNews().snapshot(),
  );
  const [rssPage, setRssPage] = useState(1);
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
          News.getAllPublishedNews().snapshot().slice(0, NEWS_ITEMS_LIMIT),
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
        setRssNewsRows(RssNews.getAllApprovedNews().snapshot());
      }
    };

    RssNews.getAll().addListener(onChange);

    return () => {
      RssNews.getAll().removeListener(onChange);
    };
  }, []);

  const onPressOurNews = useCallback(
    (id: string) => {
      navigation.navigate(NewsStackRoutes.NewsDetail, {
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
    navigation.navigate(NewsStackRoutes.OurNews);
  }, [navigation]);

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await onUpdatesSync();
      setCanLoadNext(true);
      setRssPage(1);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const onEndReached = useCallback(async () => {
    if (!canLoadNext) {
      return;
    }

    try {
      // if the cached records are over, then load new
      if (rssRowsNews.length < RSS_FEED_ITEMS_PAGE_LIMIT * rssPage) {
        setRssRefreshing(true);
        const lastItem = rssRowsNews[rssRowsNews.length - 1];
        const rows = await onRssFeedSync(lastItem.updatedAt);
        // if the rows equals 0, it means that it is the last page.
        setCanLoadNext(rows > 0);
      }

      setRssPage(prev => prev + 1);
    } finally {
      setRssRefreshing(false);
    }
  }, [canLoadNext, rssPage, rssRowsNews]);

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
});
