import {formatISO} from 'date-fns';

import {Transaction} from '@app/models/transaction';
import {
  TransactionList,
  TransactionListReceive,
  TransactionListSend,
  TransactionSource,
} from '@app/types';

export function prepareTransactions(
  source: string[],
  transactions: Transaction[],
): TransactionList[] {
  const hash = new Map();

  for (const row of transactions) {
    const result = formatISO(row.createdAt, {representation: 'date'});

    hash.set(
      result,
      (hash.get(result) ?? []).concat({
        ...row.toJSON(),
        source: source.includes(row.from.toLowerCase())
          ? TransactionSource.send
          : TransactionSource.receive,
      }),
    );
  }

  return Array.from(hash.keys())
    .map(d => new Date(d))
    .sort((a, b) => +b - +a)
    .reduce((memo: TransactionList[], key) => {
      const k = formatISO(key, {representation: 'date'});
      const tmp = (hash.get(k) ?? []).sort(
        (
          a: TransactionListSend | TransactionListReceive,
          b: TransactionListSend | TransactionListReceive,
        ) => +b.createdAt - +a.createdAt,
      );

      return memo.concat(
        {date: key, source: TransactionSource.date, hash: k, providerId: ''},
        ...tmp,
      );
    }, []);
}
