import React from 'react';

import {observer} from 'mobx-react';
import {StyleSheet} from 'react-native';

import {TransactionRow} from '@app/components/transaction-list/transaction-row';
import {Spacer} from '@app/components/ui';
import {ShadowCard} from '@app/components/ui/shadow-card';
import {WidgetHeader} from '@app/components/ui/widget-header';
import {I18N, getText} from '@app/i18n';
import {Transaction} from '@app/models/transaction';

type Props = {
  lastTransactions: Transaction[];
  isTransactionsLoading: boolean;
  addressList: string[];
  onPress: () => void;
  onRowPress(tx: Transaction): void;
};

export const TransactionsWidget = observer(
  ({lastTransactions, addressList, onPress, onRowPress}: Props) => {
    if (lastTransactions.length === 0) {
      return <></>;
    }
    return (
      <>
        <ShadowCard onPress={onPress} style={styles.wrapper}>
          <WidgetHeader title={getText(I18N.transactionWidgetShortTitle)} />
          <Spacer height={8} />
          {lastTransactions.map(item => {
            return (
              <TransactionRow
                key={`${item.id}:${item.hash}:${item.msg.type}`}
                item={item}
                addresses={addressList}
                onPress={onRowPress}
              />
            );
          })}
        </ShadowCard>
      </>
    );
  },
);

const styles = StyleSheet.create({
  wrapper: {paddingHorizontal: 16},
});
