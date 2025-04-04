import React, {useCallback, useEffect, useMemo} from 'react';

import {useFocusEffect} from '@react-navigation/native';
import {observer} from 'mobx-react';
import {
  ActivityIndicator,
  SectionList,
  SectionListProps,
  StyleSheet,
} from 'react-native';

import {Color, getColor} from '@app/colors';
import {createTheme} from '@app/helpers';
import {useRemoteConfigVar} from '@app/hooks/use-remote-config';
import {useTransactionList} from '@app/hooks/use-transaction-list';
import {Transaction} from '@app/models/transaction';

import {TransactionRow} from './transaction-row';
import {TransactionSectionHeader} from './transaction-section-header';
import {ItemData, SectionHeaderData, TransactionSection} from './types';

import {TransactionEmpty} from '../transaction-empty';
import {Loading, Spacer} from '../ui';

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
  headersEnabled: boolean,
): TransactionSection[] => {
  if (!headersEnabled) {
    return [
      {
        timestamp: '',
        data,
      },
    ];
  }
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
    const {transactions, isTransactionsLoading} = useTransactionList(addresses);
    const txTimestampHeadersEnabled = useRemoteConfigVar(
      'tx_timestamp_headers',
    );

    const sections = useMemo(
      () =>
        hideContent || (!transactions?.length && isTransactionsLoading)
          ? []
          : prepareDataForSectionList(transactions, txTimestampHeadersEnabled),
      [
        transactions,
        hideContent,
        txTimestampHeadersEnabled,
        isTransactionsLoading,
      ],
    );

    const listStyle = useMemo(
      () => StyleSheet.flatten([styles.list, style]),
      [style],
    );
    const scrollEnabled = useMemo(() => {
      if (hideContent) {
        return true;
      }
      return !!transactions.length;
    }, [hideContent, transactions]);

    /* EFFECTS */
    useEffect(() => {
      Transaction.fetchLatestTransactions(addresses);
    }, [addresses]);

    useFocusEffect(
      useCallback(() => {
        Transaction.fetchLatestTransactions(addresses, true);
      }, [addresses]),
    );

    /* CALLBACKS */
    const onEndReached = useCallback(async () => {
      if (isTransactionsLoading) {
        return;
      }
      await Transaction.fetchNextTransactions(addresses);
    }, [isTransactionsLoading]);
    const keyExtractor = useCallback(
      (item: Transaction) => `${item.id}:${item.hash}:${item.msg.type}`,
      [],
    );

    /*  RENDERER FUNCTIONS */

    const renderHeader = useCallback(
      (data: SectionHeaderData) => {
        if (!txTimestampHeadersEnabled) {
          return null;
        }
        return <TransactionSectionHeader data={data} />;
      },
      [txTimestampHeadersEnabled],
    );
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
    const renderListEmptyComponentDefault = useCallback(
      () => <TransactionEmpty />,
      [],
    );

    const renderListEmptyComponent = useMemo(() => {
      if (sectionListProps.ListEmptyComponent) {
        // if active tab is transactions and transactions are loading
        if (!hideContent && isTransactionsLoading) {
          return <Loading />;
        }
        return sectionListProps.ListEmptyComponent;
      }
      return renderListEmptyComponentDefault;
    }, [
      hideContent,
      renderListEmptyComponentDefault,
      isTransactionsLoading,
      sectionListProps.ListEmptyComponent,
    ]);

    const renderListFooterComponent = useCallback(
      () => (
        <>
          {!hideContent && !!sections.length && (
            <>
              <ActivityIndicator
                size="small"
                color={
                  isTransactionsLoading
                    ? getColor(Color.textBase2)
                    : 'transparent'
                }
              />
              <Spacer height={12} />
            </>
          )}
        </>
      ),
      [isTransactionsLoading],
    );

    return (
      <>
        <SectionList<Transaction, TransactionSection>
          overScrollMode="never"
          bounces={false}
          scrollEnabled={scrollEnabled}
          ListFooterComponent={renderListFooterComponent}
          contentContainerStyle={styles.grow}
          {...sectionListProps}
          /* CAN'NOT OVERRIDE */
          ListEmptyComponent={renderListEmptyComponent}
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
