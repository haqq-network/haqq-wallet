import React, {useCallback, useMemo, useState} from 'react';

import {FlatList, ListRenderItem} from 'react-native';

import {Color} from '@app/colors';
import {TransactionEmpty} from '@app/components/transaction-empty';
import {TransactionRow} from '@app/components/transaction-row';
import {app} from '@app/contexts';
import {createTheme} from '@app/helpers';
import {Feature, isFeatureEnabled} from '@app/helpers/is-feature-enabled';
import {I18N} from '@app/i18n';
import {BannersWrapper} from '@app/screens/banners';
import {WalletsWrapper} from '@app/screens/wallets';
import {NftCollection, TokenItem, TransactionList} from '@app/types';

import {NftViewer} from './nft-viewer';
import {TokenRow} from './token-row';
import {TopTabNavigator, TopTabNavigatorVariant} from './top-tab-navigator';
import {First, Spacer, Text} from './ui';

type HomeFeedProps = {
  refreshing: boolean;
  transactionsList: TransactionList[];
  tokensList: TokenItem[];
  nftColletionsList: NftCollection[];
  islmPrice: number;
  onWalletsRefresh: () => void;
  onPressTransactionRow: (hash: string) => void;
  onPressTokenRow: (tiker: string) => void;
};

enum TabNames {
  transactions = 'transactions',
  nft = 'nft',
  tokens = 'tokens',
}

const PAGE_ITEMS_COUNT = 15;

export const HomeFeed = ({
  refreshing,
  transactionsList,
  tokensList,
  nftColletionsList,
  islmPrice,
  onWalletsRefresh,
  onPressTokenRow,
  onPressTransactionRow,
}: HomeFeedProps) => {
  const [page, setPage] = useState(1);
  const transactionListData = useMemo(
    () => transactionsList.slice(0, PAGE_ITEMS_COUNT * page),
    [page, transactionsList],
  );
  const [activeTab, setActiveTab] = useState(TabNames.transactions);
  const scrollEnabled = useMemo(
    () =>
      activeTab === TabNames.transactions ? !!transactionsList.length : true,
    [activeTab, transactionsList.length],
  );
  const transactionsData = useMemo(
    () => (activeTab === TabNames.transactions ? transactionListData : []),
    [activeTab, transactionListData],
  );
  const onEndReached = useCallback(() => {
    setPage(prevState => prevState + 1);
  }, []);
  const onTabChange = useCallback((tabName: TabNames) => {
    setActiveTab(tabName);
  }, []);
  const renderListHeader = useCallback(() => {
    return (
      <>
        <WalletsWrapper />
        <BannersWrapper />
        <First>
          {isFeatureEnabled(Feature.tokens) && (
            <>
              <Spacer height={12} />
              <TopTabNavigator
                contentContainerStyle={styles.tabsContentContainerStyle}
                tabHeaderStyle={styles.tabHeaderStyle}
                variant={TopTabNavigatorVariant.large}
                showSeparators
                onTabChange={onTabChange}>
                <TopTabNavigator.Tab
                  name={TabNames.tokens}
                  title={I18N.homeFeedTokensTabTitle}
                  component={<Spacer height={12} />}
                />
                <TopTabNavigator.Tab
                  name={TabNames.nft}
                  title={I18N.homeFeedNftTabTitle}
                  component={null}
                />
                <TopTabNavigator.Tab
                  name={TabNames.transactions}
                  title={I18N.homeFeedTransactionTabTitle}
                  component={null}
                />
              </TopTabNavigator>
            </>
          )}
          {isFeatureEnabled(Feature.nft) && (
            <>
              <Spacer height={12} />
              <TopTabNavigator
                contentContainerStyle={styles.tabsContentContainerStyle}
                tabHeaderStyle={styles.tabHeaderStyle}
                variant={TopTabNavigatorVariant.large}
                showSeparators={false}
                onTabChange={onTabChange}>
                <TopTabNavigator.Tab
                  name={TabNames.transactions}
                  title={I18N.homeFeedTransactionTabTitle}
                  component={null}
                />
                <TopTabNavigator.Tab
                  name={TabNames.nft}
                  title={I18N.homeFeedNftTabTitle}
                  component={null}
                />
              </TopTabNavigator>
            </>
          )}
          <Text t6 i18n={I18N.transactions} style={styles.t6} />
        </First>
      </>
    );
  }, [onTabChange]);

  const transactionRenderItem: ListRenderItem<TransactionList> = useCallback(
    ({item}) => <TransactionRow item={item} onPress={onPressTransactionRow} />,
    [onPressTransactionRow],
  );

  const renderListEmptyComponent = useCallback(
    () => (
      <First>
        {activeTab === TabNames.transactions && <TransactionEmpty />}
        {activeTab === TabNames.nft && (
          <>
            <Spacer height={24} />
            <NftViewer
              data={nftColletionsList}
              scrollEnabled={false}
              style={styles.nftViewerContainer}
            />
          </>
        )}
      </First>
    ),
    [activeTab, nftColletionsList],
  );

  const transactionKeyExtractor = useCallback(
    (item: TransactionList) => item.hash,
    [],
  );

  const tokensKeyExtractor = useCallback((item: TokenItem) => item.ticker, []);
  const tokensRenderItem: ListRenderItem<TokenItem> = useCallback(
    ({item}) => (
      <TokenRow islmPrice={islmPrice} item={item} onPress={onPressTokenRow} />
    ),
    [islmPrice, onPressTokenRow],
  );

  if (activeTab === TabNames.tokens) {
    return (
      <FlatList
        key={app.providerId}
        style={styles.container}
        refreshing={refreshing}
        onRefresh={onWalletsRefresh}
        contentContainerStyle={styles.grow}
        scrollEnabled={scrollEnabled}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={renderListEmptyComponent}
        data={tokensList}
        renderItem={tokensRenderItem}
        keyExtractor={tokensKeyExtractor}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.2}
      />
    );
  }

  return (
    <FlatList
      key={app.providerId}
      style={styles.container}
      refreshing={refreshing}
      onRefresh={onWalletsRefresh}
      contentContainerStyle={styles.grow}
      scrollEnabled={scrollEnabled}
      ListHeaderComponent={renderListHeader}
      ListEmptyComponent={renderListEmptyComponent}
      data={transactionsData}
      renderItem={transactionRenderItem}
      keyExtractor={transactionKeyExtractor}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.2}
    />
  );
};

const styles = createTheme({
  container: {
    flex: 1,
  },
  grow: {flexGrow: 1},
  tabsContentContainerStyle: {
    flex: 1,
  },
  tabHeaderStyle: {
    marginHorizontal: 20,
  },
  nftViewerContainer: {
    marginHorizontal: 20,
  },
  t6: {
    marginVertical: 12,
    textAlign: 'left',
    paddingHorizontal: 20,
    color: Color.textBase1,
  },
});
