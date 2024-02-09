import React, {memo, useCallback, useEffect, useState} from 'react';

import {STORIES_ENABLED} from '@env';
import {RefreshControl, ScrollView} from 'react-native';

import {StoriesWrapper} from '@app/components/stories';
import {createTheme} from '@app/helpers';
import {loadAllTransactions} from '@app/helpers/load-transactions';
import {useTypedNavigation} from '@app/hooks';
import {Stories} from '@app/models/stories';
import {HomeFeedStackParamList, HomeFeedStackRoutes} from '@app/route-types';
import {BannersWrapper} from '@app/screens/banners';
import {WalletsWrapper} from '@app/screens/HomeStack/HomeFeedStack/wallets';
import {LockedTokensWrapper} from '@app/screens/locked-tokens';
import {WidgetRoot} from '@app/widgets';

export const HomeFeed = memo(() => {
  const [lastUpdateTimestamp, setLastUpdate] = useState(Date.now());
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useTypedNavigation<HomeFeedStackParamList>();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setLastUpdate(Date.now());
    await Promise.allSettled([loadAllTransactions(), Stories.fetch()]);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    Stories.fetch();
  }, []);

  return (
    <ScrollView
      contentContainerStyle={styles.contentContainerStyle}
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      {!!STORIES_ENABLED && (
        <StoriesWrapper
          onStoryPress={id =>
            navigation.navigate(HomeFeedStackRoutes.HomeStories, {id})
          }
        />
      )}
      <LockedTokensWrapper />
      <WalletsWrapper />
      <BannersWrapper />
      <WidgetRoot lastUpdate={lastUpdateTimestamp} />
    </ScrollView>
  );
});

const styles = createTheme({
  contentContainerStyle: {flex: 0, paddingBottom: 20},
  container: {
    flex: 1,
  },
});
