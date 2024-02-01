import React, {useCallback, useMemo, useState} from 'react';

import {FlatList, ListRenderItem} from 'react-native';

import {NftViewer} from '@app/components/nft-viewer/nft-viewer';
import {TokenViewer} from '@app/components/token-viewer';
import {TransactionEmpty} from '@app/components/transaction-empty';
import {TransactionRow} from '@app/components/transaction-row';
import {First, PopupContainer, Spacer} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {
  Feature,
  isFeatureEnabled,
  isSomeFeaturesEnabled,
} from '@app/helpers/is-feature-enabled';
import {I18N} from '@app/i18n';
import {
  BalanceData,
  ContractNameMap,
  HaqqEthereumAddress,
  IToken,
  TransactionList,
} from '@app/types';

import {TotalValueInfoHeader} from './total-value-info-header';

import {TopTabNavigator, TopTabNavigatorVariant} from '../top-tab-navigator';

export enum TotalValueTabNames {
  tokens = 'tokens',
  transactions = 'transactions',
  nft = 'nft',
}

const TabIndexMap = {
  [TotalValueTabNames.tokens]: 0,
  [TotalValueTabNames.transactions]: 1,
  [TotalValueTabNames.nft]: 2,
};

export type TotalValueInfoProps = {
  transactionsList: TransactionList[];
  balance: BalanceData;
  onPressInfo: () => void;
  onPressRow: (hash: string) => void;
  contractNameMap: ContractNameMap;
  tokens: Record<HaqqEthereumAddress, IToken[]>;
  initialTab?: TotalValueTabNames;
};

const PAGE_ITEMS_COUNT = 15;

export const TotalValueInfo = ({
  balance,
  transactionsList,
  onPressInfo,
  onPressRow,
  contractNameMap,
  tokens,
  initialTab,
}: TotalValueInfoProps) => {
  const initialTabName = useMemo(() => {
    if (
      initialTab === TotalValueTabNames.tokens &&
      isFeatureEnabled(Feature.tokens)
    ) {
      return TotalValueTabNames.tokens;
    }

    if (
      initialTab === TotalValueTabNames.nft &&
      isFeatureEnabled(Feature.nft)
    ) {
      return TotalValueTabNames.nft;
    }

    return TotalValueTabNames.transactions;
  }, []);
  const initialTabIndex = useMemo(
    () => TabIndexMap[initialTabName] ?? 0,
    [initialTabName],
  );
  const [activeTab, setActiveTab] = useState(initialTabName);
  const [page, setPage] = useState(1);
  const transactionListdata = useMemo(
    () => transactionsList.slice(0, PAGE_ITEMS_COUNT * page),
    [page, transactionsList],
  );
  const scrollEnabled = useMemo(
    () =>
      activeTab === TotalValueTabNames.transactions
        ? !!transactionsList.length
        : true,
    [activeTab, transactionsList.length],
  );
  const data = useMemo(
    () =>
      activeTab === TotalValueTabNames.transactions ? transactionListdata : [],
    [activeTab, transactionListdata],
  );

  const onEndReached = useCallback(() => {
    setPage(prevState => prevState + 1);
  }, []);
  const onTabChange = useCallback((tabName: TotalValueTabNames) => {
    setActiveTab(tabName);
  }, []);
  const renderListHeader = useCallback(
    () => (
      <>
        <TotalValueInfoHeader balance={balance} onPressInfo={onPressInfo} />
        {isSomeFeaturesEnabled([Feature.nft, Feature.tokens]) && (
          <TopTabNavigator
            initialTabIndex={initialTabIndex}
            showSeparators
            contentContainerStyle={styles.tabsContentContainerStyle}
            tabHeaderStyle={styles.tabHeaderStyle}
            variant={TopTabNavigatorVariant.large}
            onTabChange={onTabChange}>
            {isFeatureEnabled(Feature.tokens) && (
              <TopTabNavigator.Tab
                name={TotalValueTabNames.tokens}
                title={I18N.accountInfoTokensTabTitle}
                component={null}
              />
            )}
            <TopTabNavigator.Tab
              name={TotalValueTabNames.transactions}
              title={I18N.accountInfoTransactionTabTitle}
              component={null}
            />
            x
            {isFeatureEnabled(Feature.nft) && (
              <TopTabNavigator.Tab
                name={TotalValueTabNames.nft}
                title={I18N.accountInfoNftTabTitle}
                component={null}
              />
            )}
          </TopTabNavigator>
        )}
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
        {activeTab === TotalValueTabNames.transactions && <TransactionEmpty />}
        {activeTab === TotalValueTabNames.nft && (
          <>
            <Spacer height={24} />
            <NftViewer style={styles.nftViewerContainer} />
          </>
        )}
        {activeTab === TotalValueTabNames.tokens && (
          <>
            <Spacer height={24} />
            <TokenViewer data={tokens} style={styles.nftViewerContainer} />
          </>
        )}
      </First>
    ),
    [activeTab, tokens],
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
