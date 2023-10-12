import {useCallback, useEffect, useRef, useState} from 'react';

import {autorun} from 'mobx';

import {app} from '@app/contexts';
import {Events} from '@app/events';
import {prepareTransactions} from '@app/helpers';
import {awaitForEventDone} from '@app/helpers/await-for-event-done';
import {Transaction, TransactionStatus} from '@app/models/transaction';
import {TransactionList} from '@app/types';

/**
 * @example
 *  const addressList = useMemo(() => Wallet.addressList(), []);
 *  const transactionsList = useTransactionList(addressList);
 */
export function useTransactionList(addressList: string[]) {
  const prevAddressList = useRef<string[]>(addressList);
  const [transactionsList, setTransactionsList] = useState<TransactionList[]>(
    prepareTransactions(
      addressList,
      Transaction.getAllByProviderId(app.providerId),
    ),
  );

  const txUpdateTimeout = useRef<ReturnType<typeof setTimeout>>();
  const loadTransactionInfo = useCallback(async (txHash: string) => {
    // Wait while transaction status will be updated
    await awaitForEventDone(Events.onTransactionStatusLoad, txHash);
    // Get transaction from store
    const tx = Transaction.getById(txHash);

    if (tx) {
      // Run timer if transaction still in progress
      if (tx.status === TransactionStatus.inProgress) {
        txUpdateTimeout.current = setTimeout(
          () => loadTransactionInfo(txHash),
          5000,
        );
      }
    }
  }, []);

  useEffect(() => {
    const transactions = Transaction.getAllByProviderId(app.providerId);
    // Run status check for all in progress transactions
    (async () =>
      await Promise.all(
        transactions
          .filter(tx => tx.status === TransactionStatus.inProgress)
          .map(({hash}) => loadTransactionInfo(hash)),
      ))();
  }, [loadTransactionInfo]);

  useEffect(() => {
    // Deep check if addressList changed
    let isAddressListChanged = false;
    if (prevAddressList.current.length !== addressList.length) {
      prevAddressList.current = addressList;
      isAddressListChanged = true;
    } else {
      for (let i = 0; i < addressList.length; i++) {
        if (prevAddressList.current[i] !== addressList[i]) {
          prevAddressList.current = addressList;
          isAddressListChanged = true;
          break;
        }
      }
    }

    const transactions = Transaction.getAllByProviderId(app.providerId);

    const updateTransactionsList = () => {
      // Update transactionList only when addressList deeply changed
      if (isAddressListChanged) {
        setTransactionsList(prepareTransactions(addressList, transactions));
      }
    };

    const disposer = autorun(updateTransactionsList);
    app.on(Events.onProviderChanged, updateTransactionsList);

    return () => {
      clearTimer();
      disposer();
      app.off(Events.onProviderChanged, updateTransactionsList);
    };
  }, [addressList]);

  const clearTimer = () => {
    clearTimeout(txUpdateTimeout.current);
    txUpdateTimeout.current = undefined;
  };

  return transactionsList;
}
