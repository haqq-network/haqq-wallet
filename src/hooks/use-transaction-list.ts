import {useEffect, useMemo} from 'react';

import {Transaction} from '@app/models/transaction';

import {usePrevious} from './use-previous';

/**
 * @example
 *  const addressList = useMemo(() => Wallet.addressList(), []);
 *  const transactionsList = useTransactionList(addressList);
 */
export function useTransactionList(addressList: string[]) {
  const transactions = Transaction.getAll();

  const isTransactionsLoading = Transaction.isLoading;

  const prev = usePrevious(addressList) ?? [];

  //Deep check addresses to prevent infinity transactions_by_timestamp fetches
  const addresses = useMemo(
    () =>
      addressList.find((address, index) => address !== prev?.[index])
        ? addressList
        : prev,
    [],
  );

  useEffect(() => {
    Transaction.fetchLatestTransactions(addresses, true);
  }, [addresses]);

  return {transactions, isTransactionsLoading};
}
