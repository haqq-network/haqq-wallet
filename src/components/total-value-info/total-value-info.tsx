import React, {useCallback, useMemo, useState} from 'react';

import {observer} from 'mobx-react';

import {TokenViewer} from '@app/components/token-viewer';
import {TransactionEmpty} from '@app/components/transaction-empty';
import {First, Spacer} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {
  Feature,
  isFeatureEnabled,
  isSomeFeaturesEnabled,
} from '@app/helpers/is-feature-enabled';
import {I18N} from '@app/i18n';
import {Transaction} from '@app/models/transaction';
import {BalanceData, HaqqEthereumAddress, IToken} from '@app/types';

import {TotalValueInfoHeader} from './total-value-info-header';

import {NftViewer} from '../nft-viewer';
import {TopTabNavigator, TopTabNavigatorVariant} from '../top-tab-navigator';
import {TransactionList} from '../transaction-list';

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
  balance: BalanceData;
  addressList: string[];
  tokens: Record<HaqqEthereumAddress, IToken[]>;
  initialTab?: TotalValueTabNames;
  onPressTxRow: (tx: Transaction) => void;
  onPressInfo: () => void;
};

export const TotalValueInfo = observer(
  ({
    balance,
    addressList,
    tokens,
    initialTab = TotalValueTabNames.tokens,
    onPressTxRow,
    onPressInfo,
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

    const hideTransactionsContent = useMemo(
      () => activeTab !== TotalValueTabNames.transactions,
      [activeTab],
    );

    const onTabChange = useCallback((tabName: TotalValueTabNames) => {
      setActiveTab(tabName);
    }, []);
    const renderListHeader = useCallback(
      () => (
        <>
          <TotalValueInfoHeader balance={balance} onPressInfo={onPressInfo} />
          {isSomeFeaturesEnabled([Feature.nft, Feature.tokens]) && (
            <TopTabNavigator
              activeTabIndex={TabIndexMap[activeTab]}
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
      [balance, onPressInfo, onTabChange, activeTab],
    );

    const renderListEmptyComponent = useCallback(
      () => (
        <First>
          {activeTab === TotalValueTabNames.transactions && (
            <TransactionEmpty />
          )}
          {activeTab === TotalValueTabNames.nft && (
            <>
              <Spacer height={24} />
              <NftViewer
                scrollEnabled={false}
                style={styles.nftViewerContainer}
              />
            </>
          )}
          {activeTab === TotalValueTabNames.tokens && (
            <>
              <Spacer height={4} />
              <TokenViewer data={tokens} style={styles.nftViewerContainer} />
            </>
          )}
        </First>
      ),
      [activeTab, tokens],
    );

    return (
      <TransactionList
        addresses={addressList}
        onTransactionPress={onPressTxRow}
        hideContent={hideTransactionsContent}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={renderListEmptyComponent}
      />
    );
  },
);

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
    marginVertical: 12,
  },
  nftViewerContainer: {
    marginHorizontal: 20,
  },
});
