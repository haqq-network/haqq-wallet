import React, {useCallback, useMemo, useState} from 'react';

import {FlatList, ListRenderItem} from 'react-native';

import {TokenViewer} from '@app/components/token-viewer';
import {TransactionEmpty} from '@app/components/transaction-empty';
import {TransactionRow} from '@app/components/transaction-row';
import {First, PopupContainer, Spacer} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {Feature, isFeatureEnabled} from '@app/helpers/is-feature-enabled';
import {useNftCollections} from '@app/hooks/use-nft-collections';
import {I18N} from '@app/i18n';
import {Wallet} from '@app/models/wallet';
import {Balance} from '@app/services/balance';
import {
  ContractNameMap,
  HaqqEthereumAddress,
  IToken,
  TransactionList,
} from '@app/types';

import {AccountInfoHeader} from './account-info-header';

import {NftViewer} from '../nft-viewer';
import {TopTabNavigator, TopTabNavigatorVariant} from '../top-tab-navigator';

enum TabNames {
  transactions = 'transactions',
  nft = 'nft',
  tokens = 'tokens',
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
  tokens: Record<HaqqEthereumAddress, IToken[]>;
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
  tokens,
}: AccountInfoProps) => {
  const nftCollections = useNftCollections();
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
        <TopTabNavigator
          contentContainerStyle={styles.tabsContentContainerStyle}
          tabHeaderStyle={styles.tabHeaderStyle}
          variant={TopTabNavigatorVariant.large}
          onTabChange={onTabChange}
          initialTabIndex={0}>
          <TopTabNavigator.Tab
            name={TabNames.transactions}
            testID="accountInfoTabTransactions"
            title={I18N.accountInfoTransactionTabTitle}
            component={null}
          />
          {isFeatureEnabled(Feature.tokens) && (
            <TopTabNavigator.Tab
              name={TabNames.tokens}
              testID="accountInfoTabTokens"
              title={I18N.accountInfoTokensTabTitle}
              component={null}
            />
          )}
          {isFeatureEnabled(Feature.nft) && (
            <TopTabNavigator.Tab
              name={TabNames.nft}
              testID="accountInfoTabNfts"
              title={I18N.accountInfoNftTabTitle}
              component={null}
            />
          )}
        </TopTabNavigator>
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
        testID="accountInfoTransactionRow"
        onPress={onPressRow}
      />
    ),
    [contractNameMap, onPressRow],
  );
  const renderListEmptyComponent = useCallback(
    () => (
      <First>
        {activeTab === TabNames.transactions && <TransactionEmpty />}
        {activeTab === TabNames.tokens && (
          <>
            <Spacer height={24} />
            <TokenViewer
              wallet={wallet}
              data={tokens}
              style={styles.nftViewerContainer}
            />
          </>
        )}
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
    [activeTab, nftCollections],
  );

  const keyExtractor = useCallback((item: TransactionList) => item.id, []);

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
