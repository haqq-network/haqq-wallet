import {useCallback, useEffect, useState} from 'react';

import {Collection, CollectionChangeSet} from 'realm';

import {app} from '@app/contexts';
import {Events} from '@app/events';
import {prepareTransactions} from '@app/helpers';
import {Transaction} from '@app/models/transaction';
import {TransactionList} from '@app/types';
/**
 * @example
 *  const adressList = useMemo(() => Wallet?.addressList(), []);
 *  const transactionsList = useTransactionList(adressList);
 */
export function useTransactionList(adressList: string[]) {
  const [transactionsList, setTransactionsList] = useState<TransactionList[]>(
    prepareTransactions(
      adressList,
      Transaction.getAllByProviderId(app.providerId).snapshot(),
    ),
  );

  const updateTransactionsList = useCallback(() => {
    const transactions = Transaction.getAllByProviderId(app.providerId);
    setTransactionsList(
      prepareTransactions(adressList, transactions.snapshot()),
    );
  }, [adressList]);

  const onTransactionsList = useCallback(
    (collection: Collection<Transaction>, changes: CollectionChangeSet) => {
      if (
        changes.insertions.length ||
        changes.newModifications.length ||
        changes.deletions.length
      ) {
        updateTransactionsList();
      }
    },
    [updateTransactionsList],
  );

  useEffect(() => {
    const transactions = Transaction.getAllByProviderId(app.providerId);
    transactions.addListener(onTransactionsList);
    return () => {
      transactions.removeListener(onTransactionsList);
    };
  }, [onTransactionsList]);

  useEffect(() => {
    app.on(Events.onProviderChanged, updateTransactionsList);

    return () => {
      app.off(Events.onProviderChanged, updateTransactionsList);
    };
  }, [updateTransactionsList]);

  return transactionsList;
}
