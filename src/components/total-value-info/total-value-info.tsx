import React, {useCallback, useMemo, useState} from 'react';

import {observer} from 'mobx-react';

import {TokenViewer} from '@app/components/token-viewer';
import {TransactionEmpty} from '@app/components/transaction-empty';
import {First, Spacer} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {Feature, isFeatureEnabled} from '@app/helpers/is-feature-enabled';
import {useShowNft} from '@app/hooks/nft';
import {I18N} from '@app/i18n';
import {Transaction} from '@app/models/transaction';
import {BalanceModel, WalletModel} from '@app/models/wallet';
import {HaqqEthereumAddress, IToken} from '@app/types';

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
  balance: BalanceModel;
  addressList: string[];
  tokens: Record<HaqqEthereumAddress, IToken[]>;
  initialTab?: TotalValueTabNames;
  onPressTxRow: (tx: Transaction) => void;
  onPressInfo: () => void;
  onPressToken?: (wallet: WalletModel, token: IToken) => void;
};

export const TotalValueInfo = observer(
  ({
    balance,
    addressList,
    tokens,
    initialTab = TotalValueTabNames.tokens,
    onPressTxRow,
    onPressInfo,
    onPressToken,
  }: TotalValueInfoProps) => {
    const showNft = useShowNft();

    const initialTabName = useMemo(() => {
      if (
        initialTab === TotalValueTabNames.tokens &&
        isFeatureEnabled(Feature.tokens)
      ) {
        return TotalValueTabNames.tokens;
      }

      if (initialTab === TotalValueTabNames.nft && showNft) {
        return TotalValueTabNames.nft;
      }

      return TotalValueTabNames.transactions;
    }, [showNft, initialTab]);

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

    const renderListHeader = () => (
      <>
        <TotalValueInfoHeader balance={balance} onPressInfo={onPressInfo} />
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
          {showNft && (
            <TopTabNavigator.Tab
              name={TotalValueTabNames.nft}
              title={I18N.accountInfoNftTabTitle}
              component={null}
            />
          )}
        </TopTabNavigator>
      </>
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
              <TokenViewer
                data={tokens}
                style={styles.nftViewerContainer}
                onPressToken={onPressToken}
              />
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
  tabHeaderStyle: {
    marginHorizontal: 20,
    marginVertical: 12,
  },
  nftViewerContainer: {
    marginHorizontal: 20,
  },
});
