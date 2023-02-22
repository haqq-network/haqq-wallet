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
    const result = new Date(
      row.createdAt.getUTCFullYear(),
      row.createdAt.getUTCMonth(),
      row.createdAt.getUTCDate(),
      0,
      0,
      0,
      0,
    );

    const k = +result;

    console.log('k', k);

    hash.set(
      k,
      (hash.get(k) ?? []).concat({
        ...row.toJSON(),
        source: source.includes(row.from.toLowerCase())
          ? TransactionSource.send
          : TransactionSource.receive,
      }),
    );
  }

  return Array.from(hash.keys())
    .sort((a, b) => +b - +a)
    .reduce((memo: TransactionList[], key) => {
      const k = formatISO(key, {representation: 'date'});
      const tmp = (hash.get(key) ?? []).sort(
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
