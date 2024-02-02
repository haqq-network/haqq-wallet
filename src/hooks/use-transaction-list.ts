import {useEffect, useMemo} from 'react';

import {computed} from 'mobx';

import {Transaction} from '@app/models/transaction';

/**
 * @example
 *  const addressList = useMemo(() => Wallet.addressList(), []);
 *  const transactionsList = useTransactionList(addressList);
 */
export function useTransactionList(addressList: string[]) {
  const transactions = useMemo(
    () => computed(() => Transaction.getAll()),
    [],
  ).get();

  const isTransactionsLoading = useMemo(
    () => computed(() => Transaction.isLoading),
    [],
  ).get();

  useEffect(() => {
    Transaction.fetchLatestTransactions(addressList);
  }, [addressList]);

  return {transactions, isTransactionsLoading};
}
