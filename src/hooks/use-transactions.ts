import {useContext} from 'react';

import {TransactionsContext} from '@app/contexts';

export function useTransactions() {
  const context = useContext(TransactionsContext);

  return context;
}
