import React, {useCallback, useMemo, useState} from 'react';

import {FlatList, ListRenderItem, StyleSheet} from 'react-native';

import {TransactionEmpty} from '@app/components/transaction-empty';
import {TransactionRow} from '@app/components/transaction-row';
import {Feature, isFeatureEnabled} from '@app/helpers/is-feature-enabled';
import {User} from '@app/models/user';
import {WalletsWrapper} from '@app/screens/wallets';
import {TransactionList} from '@app/types';

import {NftViewer} from './nft-viewer';
import {nftCollections} from './nft-viewer/mock';
import {TopTabNavigator, TopTabNavigatorVariant} from './top-tab-navigator';
import {First, Spacer} from './ui';

type HomeFeedProps = {
  user: User;
  refreshing: boolean;
  onWalletsRefresh: () => void;
  transactionsList: TransactionList[];
  onPressRow: (hash: string) => void;
};

enum TabNames {
  transactions = 'transactions',
  nft = 'nft',
  tokens = 'tokens',
}

const PAGE_ITEMS_COUNT = 15;
export const HomeFeed = ({
  user,
  refreshing,
  onWalletsRefresh,
  transactionsList,
  onPressRow,
}: HomeFeedProps) => {
  const [page, setPage] = useState(1);
  const transactionListdata = useMemo(
    () => transactionsList.slice(0, PAGE_ITEMS_COUNT * page),
    [page, transactionsList],
  );
  const [activeTab, setActiveTab] = useState(TabNames.transactions);
  const scrollEnabled = useMemo(
    () =>
      activeTab === TabNames.transactions ? !!transactionsList.length : true,
    [activeTab, transactionsList.length],
  );
  const data = useMemo(
    () => (activeTab === TabNames.transactions ? transactionListdata : []),
    [activeTab, transactionListdata],
  );
  const onEndReached = useCallback(() => {
    setPage(prevState => prevState + 1);
  }, []);
  const onTabChange = useCallback((tabName: TabNames) => {
    setActiveTab(tabName);
  }, []);
  const renderListHeader = useCallback(
    () => (
      <>
        <WalletsWrapper />
        {isFeatureEnabled(Feature.nft) && (
          <TopTabNavigator
            contentContainerStyle={styles.tabsContentContainerStyle}
            tabHeaderStyle={styles.tabHeaderStyle}
            variant={TopTabNavigatorVariant.large}
            showSeparators
            onTabChange={onTabChange}>
            <TopTabNavigator.Tab
              name={TabNames.nft}
              title={'NFTs'}
              component={null}
            />
            <TopTabNavigator.Tab
              name={TabNames.transactions}
              title={'Transactions'}
              component={null}
            />
          </TopTabNavigator>
        )}
      </>
    ),
    [onTabChange],
  );

  const renderItem: ListRenderItem<TransactionList> = useCallback(
    ({item}) => <TransactionRow item={item} onPress={onPressRow} />,
    [onPressRow],
  );

  const renderListEmptyComponent = useCallback(
    () => (
      <First>
        {activeTab === TabNames.transactions && <TransactionEmpty />}
        {activeTab === TabNames.nft && (
          <>
            <Spacer height={24} />
            <NftViewer
              data={nftCollections}
              scrollEnabled={false}
              style={styles.nftViewerContainer}
            />
          </>
        )}
      </First>
    ),
    [activeTab],
  );

  const keyExtractor = useCallback((item: TransactionList) => item.hash, []);

  return (
    <FlatList
      key={user.providerId}
      style={styles.container}
      refreshing={refreshing}
      onRefresh={onWalletsRefresh}
      contentContainerStyle={styles.grow}
      scrollEnabled={scrollEnabled}
      ListHeaderComponent={renderListHeader}
      ListEmptyComponent={renderListEmptyComponent}
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.2}
    />
  );
};

const styles = StyleSheet.create({
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
});
