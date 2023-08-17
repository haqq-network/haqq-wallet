import React, {useCallback, useMemo, useRef, useState} from 'react';

import {FlatList, ListRenderItem} from 'react-native';

import {Color} from '@app/colors';
import {TransactionEmpty} from '@app/components/transaction-empty';
import {TransactionRow} from '@app/components/transaction-row';
import {First, PopupContainer, Spacer, Text} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {Feature, isFeatureEnabled} from '@app/helpers/is-feature-enabled';
import {useCalculatedDimensionsValue} from '@app/hooks/use-calculated-dimensions-value';
import {I18N} from '@app/i18n';
import {Wallet} from '@app/models/wallet';
import {Balance, TransactionList} from '@app/types';

import {AccountInfoHeader} from './account-info-header';

import {BottomSheet} from '../bottom-sheet';
import {NftViewer} from '../nft-viewer';
import {createNftCollectionSet} from '../nft-viewer/mock';
import {TopTabNavigator, TopTabNavigatorVariant} from '../top-tab-navigator';

enum TabNames {
  transactions = 'transactions',
  nft = 'nft',
}

export type AccountInfoProps = {
  transactionsList: TransactionList[];
  wallet: Wallet;
  balance: Balance | undefined;
  unvestedBalance: Balance | undefined;
  lockedBalance: Balance | undefined;
  vestedBalance: Balance | undefined;
  stakingBalance: Balance | undefined;
  showLockedTokensInfo: boolean;
  onPressInfo: () => void;
  onCloseLockedTokensInfo: () => void;
  onSend: () => void;
  onReceive: () => void;
  onPressRow: (hash: string) => void;
};

const PAGE_ITEMS_COUNT = 15;

export const AccountInfo = ({
  wallet,
  balance,
  transactionsList,
  stakingBalance,
  unvestedBalance,
  lockedBalance,
  vestedBalance,
  showLockedTokensInfo,
  onCloseLockedTokensInfo,
  onPressInfo,
  onSend,
  onReceive,
  onPressRow,
}: AccountInfoProps) => {
  const nftCollections = useRef(createNftCollectionSet()).current;
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
          unvestedBalance={unvestedBalance}
          lockedBalance={lockedBalance}
          vestedBalance={vestedBalance}
          stakingBalance={stakingBalance}
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
      balance,
      unvestedBalance,
      lockedBalance,
      vestedBalance,
      stakingBalance,
      onPressInfo,
      onSend,
      onReceive,
      onTabChange,
    ],
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
    [activeTab, nftCollections],
  );

  const keyExtractor = useCallback((item: TransactionList) => item.hash, []);
  const closeDistance = useCalculatedDimensionsValue(({height}) => height / 4);
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
      {showLockedTokensInfo && (
        <BottomSheet
          i18nTitle={I18N.lockedTokensInfoTitle}
          onClose={onCloseLockedTokensInfo}
          closeDistance={closeDistance}>
          <Text
            t14
            color={Color.textBase2}
            i18n={I18N.lockedTokensInfoDescription}
          />
          <Spacer height={20} />
        </BottomSheet>
      )}
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
