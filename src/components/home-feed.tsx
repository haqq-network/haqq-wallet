import React, {memo, useCallback, useState} from 'react';

import {RefreshControl, ScrollView} from 'react-native';

import {createTheme} from '@app/helpers';
import {BannersWrapper} from '@app/screens/banners';
import {LockedTokensWrapper} from '@app/screens/locked-tokens';
import {WalletsWrapper} from '@app/screens/wallets';
import {sleep} from '@app/utils';
import {WidgetRoot} from '@app/widgets';

export const HomeFeed = memo(() => {
  const [forceUpdate, forceUpdateFunc] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    forceUpdateFunc({});
    await sleep(500);
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
      <WidgetRoot forceUpdate={forceUpdate} />
    </ScrollView>
  );
});

const styles = createTheme({
  contentContainerStyle: {flex: 0, paddingBottom: 20},
  container: {
    flex: 1,
  },
});
