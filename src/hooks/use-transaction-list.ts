import {useEffect, useRef, useState} from 'react';

import {autorun} from 'mobx';

import {app} from '@app/contexts';
import {Events} from '@app/events';
import {prepareTransactions} from '@app/helpers';
import {Transaction} from '@app/models/transaction';
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
      disposer();
      app.off(Events.onProviderChanged, updateTransactionsList);
    };
  }, [addressList]);

  return transactionsList;
}
