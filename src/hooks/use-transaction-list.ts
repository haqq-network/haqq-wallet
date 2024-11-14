import {useEffect} from 'react';

import {Transaction} from '@app/models/transaction';

/**
 * @example
 *  const addressList = useMemo(() => Wallet.addressList(), []);
 *  const transactionsList = useTransactionList(addressList);
 */
export function useTransactionList(addressList: string[]) {
  const transactions = Transaction.getAll();

  const isTransactionsLoading = Transaction.isLoading;

  useEffect(() => {
    Transaction.fetchLatestTransactions(addressList, true);
  }, [addressList]);

  return {transactions, isTransactionsLoading};
}
