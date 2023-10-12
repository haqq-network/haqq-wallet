import {useCallback, useEffect, useState} from 'react';

import {app} from '@app/contexts';
import {Events} from '@app/events';
import {prepareTransactions} from '@app/helpers';
import {awaitForEventDone} from '@app/helpers/await-for-event-done';
import {Transaction} from '@app/models/transaction';
import {TransactionList} from '@app/types';

/**
 * @example
 *  const addressList = useMemo(() => Wallet.addressList(), []);
 *  const transactionsList = useTransactionList(addressList);
 */
export function useTransactionList(addressList: string[]) {
  const [transactionList, setTransactionList] = useState<TransactionList[]>(
    prepareTransactions(
      addressList,
      Transaction.getAllByProviderId(app.providerId),
    ),
  );

  const updateTransactions = useCallback(
    async (address: string) => {
      await awaitForEventDone(Events.onTransactionsLoad, address);
      const transactions = Transaction.getAllByProviderId(app.providerId);
      setTransactionList(prepareTransactions(addressList, transactions));
    },
    [addressList],
  );

  const fetchTransactions = useCallback(() => {
    addressList.forEach(address => updateTransactions(address));
  }, [addressList, updateTransactions]);

  useEffect(() => {
    app.on(Events.onProviderChanged, fetchTransactions);

    return () => {
      app.off(Events.onProviderChanged, fetchTransactions);
    };
  }, [addressList, fetchTransactions]);

  return transactionList;
}
