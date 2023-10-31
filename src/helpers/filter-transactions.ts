import {Transaction} from '@app/models/transaction';

export const filterTransactions = (
  transactions: Transaction[],
  providerId: string,
) => {
  return transactions.filter(
    t => t.providerId === providerId || t.providerId === '',
  );
};
