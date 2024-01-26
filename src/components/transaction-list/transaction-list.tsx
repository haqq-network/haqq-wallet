import React, {useCallback, useEffect, useMemo} from 'react';

import {observer} from 'mobx-react';
import {SectionList, SectionListProps, StyleSheet} from 'react-native';

import {createTheme} from '@app/helpers';
import {useTransactionList} from '@app/hooks/use-transaction-list';
import {Transaction} from '@app/models/transaction';

import {TransactionRow} from './transaction-row';
import {TransactionSectionHeader} from './transaction-section-header';
import {ItemData, SectionHeaderData, TransactionSection} from './types';

import {TransactionEmpty} from '../transaction-empty';

type OmitedSectionListProps = Omit<
  SectionListProps<Transaction, TransactionSection>,
  | 'sections'
  | 'renderItem'
  | 'keyExtractor'
  | 'renderSectionHeader'
  | 'SectionSeparatorComponent'
  | 'ItemSeparatorComponent'
  | 'onEndReached'
  | 'onEndReachedThreshold'
>;

export type TransactionListProps = {
  addresses: string[];
  hideContent?: boolean;
  onTransactionPress(tx: Transaction): void;
} & OmitedSectionListProps;

const prepareDataForSectionList = (
  data: Transaction[],
): TransactionSection[] => {
  const groupedData: Record<string, Transaction[]> = data.reduce(
    (acc, item) => {
      const createdAt = new Date(item.ts);
      const dateKey = new Date(
        createdAt.getUTCFullYear(),
        createdAt.getUTCMonth(),
        createdAt.getUTCDate(),
        0,
        0,
        0,
        0,
      ).toISOString();

      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(item);
      return acc;
    },
    {} as Record<string, Transaction[]>,
  );

  return Object.entries(groupedData).map(([date, items]) => ({
    timestamp: date,
    data: items.sort(
      (a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime(),
    ),
  }));
};

export const TransactionList = observer(
  ({
    style,
    hideContent,
    addresses,
    onTransactionPress,
    ...sectionListProps
  }: TransactionListProps) => {
    /* HOOKS */
    const {transactions} = useTransactionList(addresses);
    const sections = useMemo(
      () => (hideContent ? [] : prepareDataForSectionList(transactions)),
      [transactions, hideContent],
    );
    const listStyle = useMemo(
      () => StyleSheet.flatten([styles.list, style]),
      [style],
    );
    const scrollEnabled = useMemo(
      () => !hideContent || !!transactions.length,
      [hideContent, transactions],
    );

    /* EFFECTS */
    useEffect(() => {
      Transaction.fetchLatestTransactions(addresses);
    }, [addresses]);

    /* CALLBACKS */
    const onEndReached = useCallback(async () => {
      if (Transaction.isLoading) {
        return;
      }
      await Transaction.fetchNextTransactions(addresses);
    }, []);
    const keyExtractor = useCallback((item: Transaction) => item.id, []);

    /*  RENDERER FUNCTIONS */
    const renderHeader = useCallback((data: SectionHeaderData) => {
      return <TransactionSectionHeader data={data} />;
    }, []);
    const renderItem = useCallback(
      (data: ItemData) => {
        return (
          <TransactionRow
            data={data}
            onPress={onTransactionPress}
            addresses={addresses}
          />
        );
      },
      [addresses, onTransactionPress],
    );
    const renderListEmptyComponent = useCallback(
      () => <TransactionEmpty />,
      [],
    );

    return (
      <>
        <SectionList<Transaction, TransactionSection>
          overScrollMode="never"
          bounces={false}
          scrollEnabled={scrollEnabled}
          ListEmptyComponent={renderListEmptyComponent}
          contentContainerStyle={styles.grow}
          {...sectionListProps}
          /* CAN'NOT OVERRIDE */
          sections={sections}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          renderSectionHeader={renderHeader}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.2}
          style={listStyle}
        />
      </>
    );
  },
);

const styles = createTheme({
  list: {
    flex: 1,
  },
  grow: {flexGrow: 1},
});
