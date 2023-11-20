import React, {memo, useCallback, useState} from 'react';

import {RefreshControl, ScrollView} from 'react-native';

import {createTheme} from '@app/helpers';
import {loadAllTransactions} from '@app/helpers/load-transactions';
import {BannersWrapper} from '@app/screens/banners';
import {WalletsWrapper} from '@app/screens/HomeStack/HomeFeedStack/wallets';
import {LockedTokensWrapper} from '@app/screens/locked-tokens';
import {WidgetRoot} from '@app/widgets';

export const HomeFeed = memo(() => {
  const [lastUpdateTimestamp, setLastUpdate] = useState(Date.now());
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setLastUpdate(Date.now());
    await loadAllTransactions();
    setRefreshing(false);
  }, []);

  return (
    <ScrollView
      contentContainerStyle={styles.contentContainerStyle}
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
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
