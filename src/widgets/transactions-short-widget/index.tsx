import React, {useCallback, useMemo} from 'react';

import {observer} from 'mobx-react';

import {useTypedNavigation} from '@app/hooks';
import {useTransactionList} from '@app/hooks/use-transaction-list';
import {useWalletsAddressList} from '@app/hooks/use-wallets-address-list';
import {HomeStackRoutes} from '@app/route-types';
import {Balance} from '@app/services/balance';
import {TransactionsShortWidget} from '@app/widgets/transactions-short-widget/transactions-short-widget';

/**
 * Shows total spend and received amounts for all wallets
 *
 * TODO: requst "spend" and "received" from indexer
 */
export const TransactionsShortWidgetWrapper = observer(() => {
  const addressList = useWalletsAddressList();
  const {transactions, isTransactionsLoading} = useTransactionList(addressList);
  const navigation = useTypedNavigation();

  // FIXME:
  const received = useMemo(
    () =>
      transactions.reduce((prev, curr) => {
        if (curr.parsed.isIncoming) {
          const amounts = curr.parsed.amount;
          // if greater than 1, it's a multi coin IBC transaction, ignore it
          if (amounts.length === 1 && amounts[0].isIslamic) {
            return prev.operate(amounts[0], 'add');
          }
        }
        return prev;
      }, Balance.Empty),
    [transactions, addressList],
  );

  // FIXME:
  const spend = useMemo(
    () =>
      transactions.reduce((prev, curr) => {
        if (curr.parsed.isOutcoming) {
          const amounts = curr.parsed.amount;
          // if greater than 1, it's a multi coin IBC transaction, ignore it
          if (amounts.length === 1 && amounts[0].isIslamic) {
            return prev.operate(amounts[0], 'add');
          }
        }
        return prev;
      }, Balance.Empty),
    [transactions, addressList],
  );

  const openTotalInfo = useCallback(() => {
    navigation.navigate(HomeStackRoutes.TotalValueInfo);
  }, []);

  return (
    <TransactionsShortWidget
      spend={spend}
      received={received}
      isTransactionsLoading={isTransactionsLoading}
      onPress={openTotalInfo}
    />
  );
});
