import {
  TransactionList,
  TransactionListReceive,
  TransactionListSend,
  TransactionSource,
} from './types';
import {TransactionType} from './models/transaction';
import {formatISO} from 'date-fns';

export function isHexString(value: any, length?: number): boolean {
  if (typeof value !== 'string' || !value.match(/^0x[0-9A-Fa-f]*$/)) {
    return false;
  }
  if (length && value.length !== 2 + 2 * length) {
    return false;
  }
  return true;
}

export function prepareTransactions(
  source: string,
  transactions: TransactionType[],
): TransactionList[] {
  const hash: Map<string, (TransactionListSend | TransactionListReceive)[]> =
    new Map();

  for (const row of transactions) {
    const cloned = JSON.parse(JSON.stringify(row));
    const result = formatISO(row.createdAt, {representation: 'date'});

    const newRow = {
      ...cloned,
      source:
        row.from === source
          ? TransactionSource.send
          : TransactionSource.receive,
    };

    hash.set(result, (hash.get(result) ?? []).concat(newRow));
  }

  return Array.from(hash.keys())
    .map(d => new Date(d))
    .sort((a, b) => +b - +b)
    .reduce((memo: TransactionList[], key) => {
      const k = formatISO(key, {representation: 'date'});
      const tmp = (hash.get(k) ?? []).sort(
        (a, b) => +b.createdAt - +a.createdAt,
      );

      return memo.concat(
        {date: key, source: TransactionSource.date, hash: k},
        ...tmp,
      );
    }, []);
}
