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
  source: string[],
  transactions: TransactionType[],
): TransactionList[] {
  const hash: Map<string, (TransactionListSend | TransactionListReceive)[]> =
    new Map();

  const addressList = new Set(source);

  for (const row of transactions) {
    const cloned = JSON.parse(JSON.stringify(row));
    const result = formatISO(row.createdAt, {representation: 'date'});

    const newRow = {
      ...cloned,
      createdAt: row.createdAt,
      source: addressList.has(row.from)
        ? TransactionSource.send
        : TransactionSource.receive,
    };

    hash.set(result, (hash.get(result) ?? []).concat(newRow));
  }

  return Array.from(hash.keys())
    .map(d => new Date(d))
    .sort((a, b) => +b - +a)
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

export function shortAddress(address: string) {
  return `${address.slice(0, 4)}...${address.slice(
    address.length - 4,
    address.length,
  )}`;
}

export function sleep(duration: number) {
  return new Promise(resolve => {
    setTimeout(resolve, duration);
  });
}
