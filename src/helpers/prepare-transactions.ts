import {formatISO} from 'date-fns';
import {Results} from 'realm';

import {Transaction} from '@app/models/transaction';
import {
  TransactionList,
  TransactionListReceive,
  TransactionListSend,
  TransactionSource,
} from '@app/types';

const getSource = (transaction: Transaction, source: string[]) => {
  if (transaction.input.includes('0x') && transaction.input.length > 2) {
    return TransactionSource.contract;
  }
  return source.includes(transaction.from.toLowerCase())
    ? TransactionSource.send
    : TransactionSource.receive;
};

export function prepareTransactions(
  source: string[],
  transactions: Transaction[] | Results<Transaction>,
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

    hash.set(
      k,
      (hash.get(k) ?? []).concat({
        ...row.toJSON(),
        source: getSource(row, source),
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
