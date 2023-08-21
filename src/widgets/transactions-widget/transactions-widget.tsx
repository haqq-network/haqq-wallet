import React from 'react';

import {StyleSheet} from 'react-native';

import {ShadowCard} from '@app/components/ui/shadow-card';
import {WidgetHeader} from '@app/components/ui/widget-header';
import {Transaction} from '@app/models/transaction';
import {TransactionRowWidget} from '@app/widgets/transactions-widget/transaction-row-widget';

type Props = {
  onPress: () => void;
  lastTransactions: Transaction[];
  onRowPress: (hash: string) => void;
};

const TransactionsWidget = ({onPress, lastTransactions, onRowPress}: Props) => {
  if (lastTransactions.length === 0) {
    return null;
  }
  return (
    <ShadowCard onPress={onPress} style={styles.wrapper}>
      <WidgetHeader title={'Last transactions'} />
      {lastTransactions.map(item => {
        return <TransactionRowWidget item={item} onPress={onRowPress} />;
      })}
    </ShadowCard>
  );
};

const styles = StyleSheet.create({
  wrapper: {paddingHorizontal: 16},
});

export {TransactionsWidget};
