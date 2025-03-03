import {useEffect, useMemo} from 'react';

import {AppStore} from '@app/models/app';
import {Transaction} from '@app/models/transaction';

import {usePrevious} from './use-previous';

/**
 * @example
 *  const addressList = useMemo(() => Wallet.addressList(), []);
 *  const transactionsList = useTransactionList(addressList);
 */
export function useTransactionList(addressList: string[]) {
  const transactions = AppStore.isRpcOnly
    ? Transaction.getForWallets(addressList)
    : Transaction.getAll();

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
