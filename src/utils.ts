import {
  TransactionList,
  TransactionListReceive,
  TransactionListSend,
  TransactionSource,
} from './types';
import {TransactionType} from './models/transaction';
import {formatISO} from 'date-fns';
import {Animated} from 'react-native';
import Value = Animated.Value;

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

export function shortAddress(address: string, delimiter: string = '.') {
  return `${address.slice(0, 4)}${delimiter.repeat(4)}${address.slice(
    address.length - 4,
    address.length,
  )}`;
}

const regex = /(0x\w{2})(.*)(\w{4})$/gm;

export function splitAddress(address: string) {
  const result = regex.exec(address);

  if (!result) {
    return [];
  }

  return [result[1], result[2], result[3]];
}

export function sleep(duration: number) {
  return new Promise(resolve => {
    setTimeout(resolve, duration);
  });
}

export const asyncTiming = (pan: Value, toValue: number) => {
  return new Promise(resolve => {
    Animated.timing(pan, {
      toValue,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      return resolve();
    });
  });
};

export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
