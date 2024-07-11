import React, {useCallback, useEffect, useRef, useState} from 'react';

import {useFocusEffect, useScrollToTop} from '@react-navigation/native';
import {isAfter} from 'date-fns';
import {observer} from 'mobx-react';
import {RefreshControl, ScrollView} from 'react-native';
import Config from 'react-native-config';

import {StoriesWrapper} from '@app/components/stories';
import {createTheme, showModal} from '@app/helpers';
import {loadAllTransactions} from '@app/helpers/load-transactions';
import {useTypedNavigation} from '@app/hooks';
import {Nft} from '@app/models/nft';
import {Token} from '@app/models/tokens';
import {VariablesBool} from '@app/models/variables-bool';
import {VariablesDate} from '@app/models/variables-date';
import {HomeFeedStackParamList, HomeFeedStackRoutes} from '@app/route-types';
import {BannersWrapper} from '@app/screens/banners';
import {WalletsWrapper} from '@app/screens/HomeStack/HomeFeedStack/wallets';
import {LockedTokensWrapper} from '@app/screens/locked-tokens';
import {ModalType} from '@app/types';
import {WidgetRoot} from '@app/widgets';

export const HomeFeed = observer(() => {
  const ref = useRef(null);
  useScrollToTop(ref);
  const [lastUpdateTimestamp, setLastUpdate] = useState(Date.now());
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useTypedNavigation<HomeFeedStackParamList>();

  const onRefresh = useCallback(async (skipLoading = false) => {
    if (!skipLoading) {
      setRefreshing(true);
    }
    setLastUpdate(Date.now());
    await Promise.allSettled([
      loadAllTransactions(),
      Token.fetchTokens(),
      Nft.fetchNft(),
    ]);
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      onRefresh(true);
    }, []),
  );

  useEffect(() => {
    const snoozed = VariablesDate.get('snoozeNotifications');
    if (!VariablesBool.exists('notifications')) {
      if (snoozed && isAfter(snoozed, new Date())) {
        return;
      }
      showModal(ModalType.popupNotification);
    }
  }, []);

  const onStoryPress = useCallback(
    (id: string) => {
      navigation.navigate(HomeFeedStackRoutes.HomeStories, {id});
    },
    [navigation],
  );

  return (
    <ScrollView
      ref={ref}
      testID="home-feed-container"
      contentContainerStyle={styles.contentContainerStyle}
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      {!!Config.STORIES_ENABLED && (
        <StoriesWrapper onStoryPress={onStoryPress} />
      )}
      <LockedTokensWrapper />
      <WalletsWrapper />
      <BannersWrapper />
      <WidgetRoot lastUpdate={lastUpdateTimestamp} />
    </ScrollView>
  );
});

const styles = createTheme({
  contentContainerStyle: {flex: 0, paddingBottom: 20, paddingTop: 8},
  container: {
    flex: 1,
  },
});
