import React, {useCallback, useState} from 'react';

import {STORIES_ENABLED} from '@env';
import {useFocusEffect} from '@react-navigation/native';
import {observer} from 'mobx-react';
import {RefreshControl, ScrollView} from 'react-native';

import {StoriesWrapper} from '@app/components/stories';
import {createTheme} from '@app/helpers';
import {loadAllTransactions} from '@app/helpers/load-transactions';
import {useTypedNavigation} from '@app/hooks';
import {Stories} from '@app/models/stories';
import {Token} from '@app/models/tokens';
import {HomeFeedStackParamList, HomeFeedStackRoutes} from '@app/route-types';
import {BannersWrapper} from '@app/screens/banners';
import {WalletsWrapper} from '@app/screens/HomeStack/HomeFeedStack/wallets';
import {LockedTokensWrapper} from '@app/screens/locked-tokens';
import {WidgetRoot} from '@app/widgets';

export const HomeFeed = observer(() => {
  const [lastUpdateTimestamp, setLastUpdate] = useState(Date.now());
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useTypedNavigation<HomeFeedStackParamList>();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setLastUpdate(Date.now());
    await Promise.allSettled([
      loadAllTransactions(),
      Stories.fetch(),
      Token.fetchTokens(),
    ]);
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      onRefresh();
    }, []),
  );

  const onStoryPress = useCallback(
    (id: string) => {
      navigation.navigate(HomeFeedStackRoutes.HomeStories, {id});
    },
    [navigation],
  );

  return (
    <ScrollView
      contentContainerStyle={styles.contentContainerStyle}
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      {!!STORIES_ENABLED && <StoriesWrapper onStoryPress={onStoryPress} />}
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
