import React, {useCallback, useMemo, useState} from 'react';

import {FlatList, ListRenderItem} from 'react-native';

import {TransactionEmpty} from '@app/components/transaction-empty';
import {TransactionRow} from '@app/components/transaction-row';
import {First, PopupContainer, Spacer} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {Feature, isFeatureEnabled} from '@app/helpers/is-feature-enabled';
import {Wallet} from '@app/models/wallet';
import {TransactionList} from '@app/types';

import {AccountInfoHeader} from './account-info-header';

import {NftViewer} from '../nft-viewer';
import {nftCollections} from '../nft-viewer/mock';
import {TopTabNavigator, TopTabNavigatorVariant} from '../top-tab-navigator';

enum TabNames {
  transactions = 'transactions',
  nft = 'nft',
}

export type AccountInfoProps = {
  transactionsList: TransactionList[];
  wallet: Wallet;
  balance: number;
  onSend: () => void;
  onReceive: () => void;
  onPressRow: (hash: string) => void;
};
const PAGE_ITEMS_COUNT = 15;
export const AccountInfo = ({
  wallet,
  balance,
  onSend,
  onReceive,
  onPressRow,
  transactionsList,
}: AccountInfoProps) => {
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
        <AccountInfoHeader
          wallet={wallet}
          balance={balance}
          onSend={onSend}
          onReceive={onReceive}
        />
        {isFeatureEnabled(Feature.nft) && (
          <TopTabNavigator
            contentContainerStyle={styles.tabsContentContainerStyle}
            tabHeaderStyle={styles.tabHeaderStyle}
            variant={TopTabNavigatorVariant.large}
            onTabChange={onTabChange}>
            <TopTabNavigator.Tab
              name={TabNames.transactions}
              title={'Transactions'}
              component={null}
            />
            <TopTabNavigator.Tab
              name={TabNames.nft}
              title={'NFTs'}
              component={null}
            />
          </TopTabNavigator>
        )}
      </>
    ),
    [balance, onReceive, onSend, onTabChange, wallet],
  );
  const renderItem: ListRenderItem<TransactionList> = useCallback(
    ({item}) => <TransactionRow item={item} onPress={onPressRow} />,
    [onPressRow],
  );
  const renderListEmptyComponent = useCallback(
    () => (
      <First>
        {activeTab === TabNames.transactions && <TransactionEmpty />}
        <>
          <Spacer height={24} />
          <NftViewer
            data={nftCollections}
            scrollEnabled={false}
            style={styles.nftViewerContainer}
          />
        </>
      </First>
    ),
    [activeTab],
  );

  const keyExtractor = useCallback((item: TransactionList) => item.hash, []);

  return (
    <PopupContainer plain>
      <FlatList
        overScrollMode="never"
        bounces={false}
        style={styles.container}
        scrollEnabled={scrollEnabled}
        ListHeaderComponent={renderListHeader}
        contentContainerStyle={styles.grow}
        ListEmptyComponent={renderListEmptyComponent}
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.2}
      />
    </PopupContainer>
  );
};

const styles = createTheme({
  tabsContentContainerStyle: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  grow: {flexGrow: 1},
  tabHeaderStyle: {
    marginHorizontal: 20,
  },
  nftViewerContainer: {
    marginHorizontal: 20,
  },
});
