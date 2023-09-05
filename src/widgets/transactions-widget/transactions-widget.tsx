import React from 'react';

import {StyleSheet} from 'react-native';

import {ShadowCard} from '@app/components/ui/shadow-card';
import {WidgetHeader} from '@app/components/ui/widget-header';
import {I18N, getText} from '@app/i18n';
import {Wallet} from '@app/models/wallet';
import {
  ContractNameMap,
  OnTransactionRowPress,
  TransactionListContract,
  TransactionListReceive,
  TransactionListSend,
} from '@app/types';
import {TransactionRowWidget} from '@app/widgets/transactions-widget/transaction-row-widget';

type Props = {
  onPress: () => void;
  lastTransactions: (
    | TransactionListSend
    | TransactionListReceive
    | TransactionListContract
  )[];
  onRowPress: OnTransactionRowPress;
  wallets: Realm.Results<Wallet>;
  contractNameMap: ContractNameMap;
};

export const TransactionsWidget = ({
  onPress,
  lastTransactions,
  onRowPress,
  wallets,
  contractNameMap,
}: Props) => {
  if (lastTransactions.length === 0) {
    return null;
  }
  return (
    <ShadowCard onPress={onPress} style={styles.wrapper}>
      <WidgetHeader title={getText(I18N.transactionWidgetShortTitle)} />
      {lastTransactions.map(item => {
        return (
          <TransactionRowWidget
            key={item.hash}
            item={item}
            onPress={onRowPress}
            wallets={wallets}
            contractNameMap={contractNameMap}
          />
        );
      })}
    </ShadowCard>
  );
};

const styles = StyleSheet.create({
  wrapper: {paddingHorizontal: 16},
});
