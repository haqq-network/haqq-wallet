import React, {useCallback, useMemo, useRef, useState} from 'react';

import {FlatList, ListRenderItem} from 'react-native';

import {TokenViewer} from '@app/components/token-viewer';
import {TransactionEmpty} from '@app/components/transaction-empty';
import {TransactionRow} from '@app/components/transaction-row';
import {First, PopupContainer, Spacer} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
import {
  BalanceData,
  ContractNameMap,
  IToken,
  TransactionList,
} from '@app/types';

import {TotalValueInfoHeader} from './total-value-info-header';

import {NftViewer} from '../nft-viewer';
import {createNftCollectionSet} from '../nft-viewer/mock';
import {TopTabNavigator, TopTabNavigatorVariant} from '../top-tab-navigator';

enum TabNames {
  tokens = 'tokens',
  transactions = 'transactions',
  nft = 'nft',
}

export type TotalValueInfoProps = {
  transactionsList: TransactionList[];
  balance: BalanceData;
  onPressInfo: () => void;
  onPressRow: (hash: string) => void;
  contractNameMap: ContractNameMap;
  tokens: Record<string, IToken[]>;
};

const PAGE_ITEMS_COUNT = 15;

export const TotalValueInfo = ({
  balance,
  transactionsList,
  onPressInfo,
  onPressRow,
  contractNameMap,
  tokens,
}: TotalValueInfoProps) => {
  const nftCollections = useRef(createNftCollectionSet()).current;
  const [page, setPage] = useState(1);
  const transactionListdata = useMemo(
    () => transactionsList.slice(0, PAGE_ITEMS_COUNT * page),
    [page, transactionsList],
  );
  const [activeTab, setActiveTab] = useState(TabNames.tokens);
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
        <TotalValueInfoHeader balance={balance} onPressInfo={onPressInfo} />
        <TopTabNavigator
          initialTabIndex={0}
          showSeparators
          contentContainerStyle={styles.tabsContentContainerStyle}
          tabHeaderStyle={styles.tabHeaderStyle}
          variant={TopTabNavigatorVariant.large}
          onTabChange={onTabChange}>
          <TopTabNavigator.Tab
            name={TabNames.tokens}
            title={'Tokens'}
            component={null}
          />
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
      </>
    ),
    [balance, onPressInfo, onTabChange],
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
        {activeTab === TabNames.tokens && (
          <>
            <Spacer height={24} />
            <TokenViewer data={tokens} style={styles.nftViewerContainer} />
          </>
        )}
      </First>
    ),
    [activeTab, nftCollections, tokens],
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
