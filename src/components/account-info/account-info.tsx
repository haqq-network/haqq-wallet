import React, {useCallback, useMemo, useState} from 'react';

import {observer} from 'mobx-react';

import {TokenViewer} from '@app/components/token-viewer';
import {TransactionEmpty} from '@app/components/transaction-empty';
import {First, PopupContainer, Spacer} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {Feature, isFeatureEnabled} from '@app/helpers/is-feature-enabled';
import {useShowNft} from '@app/hooks/nft';
import {I18N} from '@app/i18n';
import {Wallet} from '@app/models/wallet';
import {Balance} from '@app/services/balance';
import {HaqqEthereumAddress, IToken, IndexerTransaction} from '@app/types';

import {AccountInfoHeader} from './account-info-header';

import {NftViewer} from '../nft-viewer';
import {TopTabNavigator, TopTabNavigatorVariant} from '../top-tab-navigator';
import {TransactionList} from '../transaction-list';

enum TabNames {
  transactions = 'transactions',
  nft = 'nft',
  tokens = 'tokens',
}

export type AccountInfoProps = {
  wallet: Wallet;
  available: Balance;
  locked: Balance;
  staked: Balance;
  total: Balance;
  vested: Balance;
  unlock: Date;
  tokens: Record<HaqqEthereumAddress, IToken[]>;
  onPressInfo: () => void;
  onSend: () => void;
  onReceive: () => void;
  onPressTxRow: (tx: IndexerTransaction) => void;
  onPressToken?: (wallet: Wallet, token: IToken) => void;
};

const TAB_INDEX_MAP = {
  [TabNames.tokens]: 0,
  [TabNames.transactions]: 1,
  [TabNames.nft]: 2,
};

export const AccountInfo = observer(
  ({
    wallet,
    available,
    locked,
    staked,
    total,
    unlock,
    vested,
    tokens,
    onPressInfo,
    onSend,
    onReceive,
    onPressTxRow,
    onPressToken,
  }: AccountInfoProps) => {
    const [activeTab, setActiveTab] = useState(TabNames.tokens);

    const hideTransactionsContent = useMemo(
      () => (activeTab === TabNames.transactions ? false : true),
      [activeTab],
    );

    const onTabChange = useCallback((tabName: TabNames) => {
      setActiveTab(tabName);
    }, []);

    const showNft = useShowNft();

    const renderListHeader = useMemo(() => {
      return (
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
            activeTabIndex={TAB_INDEX_MAP[activeTab]}
            initialTabIndex={TAB_INDEX_MAP[TabNames.tokens]}>
            {isFeatureEnabled(Feature.tokens) && (
              <TopTabNavigator.Tab
                testID="accountInfoTabTokens"
                name={TabNames.tokens}
                title={I18N.accountInfoTokensTabTitle}
                component={null}
              />
            )}
            <TopTabNavigator.Tab
              testID="accountInfoTabTransactions"
              name={TabNames.transactions}
              title={I18N.accountInfoTransactionTabTitle}
              component={null}
            />
            {showNft && (
              <TopTabNavigator.Tab
                testID="accountInfoTabNft"
                name={TabNames.nft}
                title={I18N.accountInfoNftTabTitle}
                component={null}
              />
            )}
          </TopTabNavigator>
        </>
      );
    }, [activeTab]);

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
                onPressToken={onPressToken}
                style={styles.nftViewerContainer}
              />
            </>
          )}
          {activeTab === TabNames.nft && (
            <>
              <Spacer height={24} />
              <NftViewer
                wallet={wallet}
                scrollEnabled={false}
                style={styles.nftViewerContainer}
              />
            </>
          )}
        </First>
      ),
      [activeTab],
    );

    return (
      <PopupContainer plain>
        <TransactionList
          addresses={[wallet.address]}
          hideContent={hideTransactionsContent}
          onTransactionPress={onPressTxRow}
          ListHeaderComponent={renderListHeader}
          ListEmptyComponent={renderListEmptyComponent}
        />
      </PopupContainer>
    );
  },
);

const styles = createTheme({
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
