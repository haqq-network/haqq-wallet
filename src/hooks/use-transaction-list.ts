import {useMemo} from 'react';

import {computed} from 'mobx';

import {Transaction} from '@app/models/transaction';

import {useEffectAsync} from './use-effect-async';

/**
 * @example
 *  const addressList = useMemo(() => Wallet.addressList(), []);
 *  const transactionsList = useTransactionList(addressList);
 */
export function useTransactionList(addressList: string[]) {
  const transactions = useMemo(() => {
    return computed(() => Transaction.getAll());
  }, []).get();

  useEffectAsync(async () => {
    await Transaction.fetchLatestTransactions(addressList);
  }, []);

  return {transactions};
}
