import {useMemo} from 'react';

import {computed} from 'mobx';

import {Transaction} from '@app/models/transaction';

export const useTransaction = (txId: string) => {
  const tx = useMemo(() => {
    return computed(() => Transaction.getById(txId));
  }, [txId]).get();

  return tx!;
};
