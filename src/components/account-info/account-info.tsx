import React, {useCallback, useMemo, useState} from 'react';

import {FlatList, ListRenderItem} from 'react-native';

import {NftViewer} from '@app/components/nft-viewer/nft-viewer';
import {TransactionEmpty} from '@app/components/transaction-empty';
import {TransactionRow} from '@app/components/transaction-row';
import {First, PopupContainer, Spacer} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {Feature, isFeatureEnabled} from '@app/helpers/is-feature-enabled';
import {I18N} from '@app/i18n';
import {Wallet} from '@app/models/wallet';
import {Balance} from '@app/services/balance';
import {ContractNameMap, TransactionList} from '@app/types';

import {AccountInfoHeader} from './account-info-header';

import {TopTabNavigator, TopTabNavigatorVariant} from '../top-tab-navigator';

enum TabNames {
  transactions = 'transactions',
  nft = 'nft',
}

export type AccountInfoProps = {
  transactionsList: TransactionList[];
  wallet: Wallet;
  onPressInfo: () => void;
  onSend: () => void;
  onReceive: () => void;
  onPressRow: (hash: string) => void;
  contractNameMap: ContractNameMap;
  available: Balance;
  locked: Balance;
  staked: Balance;
  total: Balance;
  vested: Balance;
  unlock: Date;
};

const PAGE_ITEMS_COUNT = 15;

export const AccountInfo = ({
  wallet,
  transactionsList,
  available,
  locked,
  staked,
  total,
  unlock,
  vested,
  onPressInfo,
  onSend,
  onReceive,
  onPressRow,
  contractNameMap,
}: AccountInfoProps) => {
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
  const data = useMemo(
    () => (activeTab === TabNames.transactions ? transactionListData : []),
    [activeTab, transactionListData],
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
          available={available}
          locked={locked}
          staked={staked}
          total={total}
          unlock={unlock}
          vested={vested}
          onPressInfo={onPressInfo}
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
              title={I18N.accountInfoTransactionTabTitle}
              component={null}
            />
            <TopTabNavigator.Tab
              name={TabNames.nft}
              title={I18N.accountInfoNftTabTitle}
              component={null}
            />
          </TopTabNavigator>
        )}
      </>
    ),
    [
      wallet,
      available,
      locked,
      staked,
      total,
      unlock,
      vested,
      onPressInfo,
      onSend,
      onReceive,
      onTabChange,
    ],
  );
  const renderItem: ListRenderItem<TransactionList> = useCallback(
    ({item}) => (
      <TransactionRow
        contractNameMap={contractNameMap}
        item={item}
        onPress={onPressRow}
      />
    ),
    [contractNameMap, onPressRow],
  );
  const renderListEmptyComponent = useCallback(
    () => (
      <First>
        {activeTab === TabNames.transactions && <TransactionEmpty />}
        <>
          <Spacer height={24} />
          <NftViewer style={styles.nftViewerContainer} />
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
