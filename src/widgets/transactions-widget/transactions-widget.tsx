import React from 'react';

import {StyleSheet} from 'react-native';

import {ShadowCard} from '@app/components/ui/shadow-card';
import {WidgetHeader} from '@app/components/ui/widget-header';
import {I18N, getText} from '@app/i18n';
import {Transaction} from '@app/models/transaction';
import {Wallet} from '@app/models/wallet';
import {TransactionRowWidget} from '@app/widgets/transactions-widget/transaction-row-widget';

type Props = {
  onPress: () => void;
  lastTransactions: Transaction[];
  onRowPress: (hash: string) => void;
  wallets: Realm.Results<Wallet>;
};

export const TransactionsWidget = ({
  onPress,
  lastTransactions,
  onRowPress,
  wallets,
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
          />
        );
      })}
    </ShadowCard>
  );
};

const styles = StyleSheet.create({
  wrapper: {paddingHorizontal: 16},
});
