import React, {useCallback, useEffect, useRef, useState} from 'react';

import {useFocusEffect, useScrollToTop} from '@react-navigation/native';
import {isAfter} from 'date-fns';
import {observer} from 'mobx-react';
import {RefreshControl, ScrollView} from 'react-native';
import Config from 'react-native-config';

import {StoriesWrapper} from '@app/components/stories';
import {createTheme, showModal} from '@app/helpers';
import {exportWallet} from '@app/helpers/export';
import {useTypedNavigation} from '@app/hooks';
import {AppStore} from '@app/models/app';
import {BannerButtonEvent, BannerType} from '@app/models/banner';
import {Currencies} from '@app/models/currencies';
import {Nft} from '@app/models/nft';
import {Provider} from '@app/models/provider';
import {Token} from '@app/models/tokens';
import {Transaction} from '@app/models/transaction';
import {VariablesBool} from '@app/models/variables-bool';
import {VariablesDate} from '@app/models/variables-date';
import {Wallet} from '@app/models/wallet';
import {HomeFeedStackParamList, HomeFeedStackRoutes} from '@app/route-types';
import {BannersWrapper} from '@app/screens/banners';
import {WalletsWrapper} from '@app/screens/HomeStack/HomeFeedStack/wallets';
import {LockedTokensWrapper} from '@app/screens/locked-tokens';
import {ModalType} from '@app/types';
import {WidgetRoot} from '@app/widgets';
import {LayoutWidget} from '@app/widgets/layout-widget/layout-widget';

import {HomeBanner} from './home-banner';
import {Spacer} from './ui';

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
      !AppStore.isRpcOnly && Currencies.fetchCurrencies(),
      Wallet.fetchBalances(),
      Token.fetchTokens(),
      Nft.fetchNft(),
      Transaction.fetchLatestTransactions(Wallet.addressListAllVisible(), true),
    ]);
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      onRefresh(true);
      return () => Wallet.fetchBalances();
    }, []),
  );

  useEffect(() => {
    if (AppStore.isDetoxRunning) {
      return;
    }
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
      <React.Fragment key={Provider.selectedProviderId}>
        <LockedTokensWrapper />
        <WalletsWrapper />
      </React.Fragment>
      <BannersWrapper />
      <Spacer height={12} />
      <LayoutWidget
        key={'export-layout'}
        direction="vertical"
        deep={true}
        children={[
          <HomeBanner
            key={'export-banner'}
            onPress={exportWallet}
            banner={{
              id: 'export_wallet',
              type: BannerType.export,
              title: 'Export to Haqqabi',
              description: 'Export your mnemonic wallet to Haqqabi',
              isUsed: false,
              snoozedUntil: new Date(),
              defaultEvent: BannerButtonEvent.export,
              closeEvent: BannerButtonEvent.none,
              backgroundImage: require('@assets/images/export-banner-bg.png'),
              priority: 10,
            }}
          />,
        ]}
      />
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
