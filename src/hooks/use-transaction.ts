import {useMemo} from 'react';

import {computed} from 'mobx';

import {Transaction} from '@app/models/transaction';
import {IndexerTxMsgType} from '@app/types';

export const useTransaction = (txId: string, txType: IndexerTxMsgType) => {
  const tx = useMemo(() => {
    return computed(() => Transaction.getById(txId, txType));
  }, [txId, txType]).get();

  return tx!;
};
