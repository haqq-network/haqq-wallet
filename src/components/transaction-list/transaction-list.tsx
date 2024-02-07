import React, {useCallback, useEffect, useMemo} from 'react';

import {observer} from 'mobx-react';
import {
  ActivityIndicator,
  SectionList,
  SectionListProps,
  StyleSheet,
} from 'react-native';

import {Color, getColor} from '@app/colors';
import {createTheme} from '@app/helpers';
import {useTransactionList} from '@app/hooks/use-transaction-list';
import {Transaction} from '@app/models/transaction';

import {TransactionRow} from './transaction-row';
import {ItemData, SectionHeaderData, TransactionSection} from './types';

import {TransactionEmpty} from '../transaction-empty';
import {Spacer} from '../ui';

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
  // TODO: uncomment when backend will be ready
  // const groupedData: Record<string, Transaction[]> = data.reduce(
  //   (acc, item) => {
  //     const createdAt = new Date(item.ts);
  //     const dateKey = new Date(
  //       createdAt.getUTCFullYear(),
  //       createdAt.getUTCMonth(),
  //       createdAt.getUTCDate(),
  //       0,
  //       0,
  //       0,
  //       0,
  //     ).toISOString();
  //     if (!acc[dateKey]) {
  //       acc[dateKey] = [];
  //     }
  //     acc[dateKey].push(item);
  //     return acc;
  //   },
  //   {} as Record<string, Transaction[]>,
  // );
  // return Object.entries(groupedData).map(([date, items]) => ({
  //   timestamp: date,
  //   data: items.sort(
  //     (a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime(),
  //   ),
  // }));
  return [
    {
      timestamp: '',
      data,
    },
  ];
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
    const {transactions, isTransactionsLoading} = useTransactionList(addresses);
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
      if (isTransactionsLoading) {
        return;
      }
      await Transaction.fetchNextTransactions(addresses);
    }, [isTransactionsLoading]);
    const keyExtractor = useCallback(
      (item: Transaction) => `${item.id}:${item.hash}`,
      [],
    );

    /*  RENDERER FUNCTIONS */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const renderHeader = useCallback((data: SectionHeaderData) => {
      // TODO: uncomment when backend will be ready
      // return <TransactionSectionHeader data={data} />;
      return null;
    }, []);
    const renderItem = useCallback(
      (data: ItemData) => {
        return (
          <TransactionRow
            withPadding
            item={data.item}
            addresses={addresses}
            onPress={onTransactionPress}
          />
        );
      },
      [addresses, onTransactionPress],
    );
    const renderListEmptyComponent = useCallback(
      () => <TransactionEmpty />,
      [],
    );
    const renderListFooterComponent = useCallback(
      () => (
        <>
          <ActivityIndicator
            size="small"
            color={
              isTransactionsLoading ? getColor(Color.textBase2) : 'transparent'
            }
          />
          <Spacer height={12} />
        </>
      ),
      [isTransactionsLoading],
    );
    Logger.log({isTransactionsLoading});

    return (
      <>
        <SectionList<Transaction, TransactionSection>
          overScrollMode="never"
          bounces={false}
          scrollEnabled={scrollEnabled}
          ListEmptyComponent={renderListEmptyComponent}
          ListFooterComponent={renderListFooterComponent}
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
