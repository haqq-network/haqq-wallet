import React, {useCallback, useMemo, useState} from 'react';

import {ScrollView} from 'react-native-gesture-handler';

import {TransactionEmpty} from '@app/components/transaction-empty';
import {TransactionRow} from '@app/components/transaction-row';
import {First, PopupContainer, Spacer} from '@app/components/ui';
import {createTheme} from '@app/helpers';
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
export const AccountInfo = ({
  wallet,
  balance,
  onSend,
  onReceive,
  onPressRow,
  transactionsList,
}: AccountInfoProps) => {
  const [activeTab, setActiveTab] = useState(TabNames.transactions);

  const scrollEnabled = useMemo(
    () =>
      activeTab === TabNames.transactions ? !!transactionsList.length : true,
    [activeTab, transactionsList.length],
  );

  const renderTransactionTab = useCallback(
    () => (
      <First>
        {!transactionsList?.length && <TransactionEmpty />}
        <>
          {transactionsList?.map(tx => (
            <TransactionRow key={tx.hash} item={tx} onPress={onPressRow} />
          ))}
        </>
      </First>
    ),
    [onPressRow, transactionsList],
  );

  const renderNftTab = useCallback(
    () => (
      <>
        <Spacer height={20} />
        <NftViewer
          data={nftCollections}
          scrollEnabled={false}
          style={styles.nftViewerContainer}
        />
      </>
    ),
    [],
  );

  const onTabChange = useCallback((tabName: TabNames) => {
    setActiveTab(tabName);
  }, []);

  return (
    <PopupContainer plain>
      <ScrollView
        overScrollMode="never"
        bounces={false}
        style={styles.container}
        scrollEnabled={scrollEnabled}
        contentContainerStyle={styles.grow}>
        <AccountInfoHeader
          wallet={wallet}
          balance={balance}
          onSend={onSend}
          onReceive={onReceive}
        />
        <TopTabNavigator
          tabHeaderStyle={styles.tabHeaderStyle}
          variant={TopTabNavigatorVariant.large}
          onTabChange={onTabChange}>
          <TopTabNavigator.Tab
            name={TabNames.transactions}
            title="Transactions"
            component={renderTransactionTab}
          />
          <TopTabNavigator.Tab
            name={TabNames.nft}
            title={'NFTs'}
            component={renderNftTab}
          />
        </TopTabNavigator>
      </ScrollView>
    </PopupContainer>
  );
};

const styles = createTheme({
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
