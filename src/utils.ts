import {PATTERNS_SOURCE} from '@env';
import {SessionTypes, SignClientTypes} from '@walletconnect/types';
import {utils} from 'ethers';
import {Animated} from 'react-native';

import {I18N} from './i18n';
import {WalletConnectParsedAccount} from './types';
import {EIP155_SIGNING_METHODS} from './variables/EIP155';

export function isHexString(value: any, length?: number): boolean {
  if (typeof value !== 'string' || !value.match(/^0x[0-9A-Fa-f]*$/)) {
    return false;
  }
  if (length && value.length !== 2 + 2 * length) {
    return false;
  }
  return true;
}

const numbersRegExp = /^[0-9]*\.?[0-9]*$/;

export function isNumber(value: string) {
  return value.match(numbersRegExp);
}

export function shortAddress(address: string, delimiter: string = '.') {
  return `${address.slice(0, 4)}${delimiter.repeat(4)}${address.slice(
    address.length - 4,
    address.length,
  )}`;
}

const regex = /(0x\w{2})(.*)(\w{4})$/gm;

export function splitAddress(address: string) {
  regex.lastIndex = 0;
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

export const asyncTiming = (pan: Animated.Value, toValue: number) => {
  return new Promise<void>(resolve => {
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
    // eslint-disable-next-line no-bitwise
    const r = (Math.random() * 16) | 0,
      // eslint-disable-next-line no-bitwise
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function makeID(length: number) {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;

  return Array.from({length})
    .map(() => characters.charAt(Math.floor(Math.random() * charactersLength)))
    .join('');
}

export const generateFlatColors = () => {
  const dark = !!Math.round(Math.random());

  const h = randomNumber(60, 336);
  const b = dark ? randomNumber(16, 40) : randomNumber(58, 75);

  return [
    [h, 76, b],
    [h, 76, b],
    [h, 76, b - (dark ? -20 : 10)],
  ].map(color => HSBToHEX(color[0], color[1], color[2]));
};

export const generateGradientColors = () => {
  const dark = !!Math.round(Math.random());

  const h = randomNumber(0, 359);
  const b = dark ? randomNumber(34, 54) : randomNumber(72, 84);

  return [
    [h, 50, b],
    [h, 70, b - 14],
    [h, 62, b - (dark ? -16 : 20)],
  ].map(color => HSBToHEX(color[0], color[1], color[2]));
};

function randomNumber(min: number, max: number) {
  return Math.ceil(Math.random() * (max - min) + min);
}

function componentToHex(c: number) {
  return c.toString(16).padStart(2, '0');
}

export const HSBToHEX = (h: number, s: number, b: number) => {
  s /= 100;
  b /= 100;
  const k = (n: number) => (n + h / 60) % 6;
  const f = (n: number) =>
    b * (1 - s * Math.max(0, Math.min(k(n), 4 - k(n), 1)));
  return `#${componentToHex(Math.round(255 * f(5)))}${componentToHex(
    Math.round(255 * f(3)),
  )}${componentToHex(Math.round(255 * f(1)))}`;
};

export function getPatternName(pattern: string) {
  return `${PATTERNS_SOURCE}${pattern}@3x.png`;
}

export function shuffleWords(words: Map<string, string>) {
  return Array.from(words.keys()).sort(() => 0.5 - Math.random());
}

export function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function debounce<T extends Array<any>>(
  func: (...param: T) => void,
  wait: number,
) {
  let timeout: string | number | NodeJS.Timeout | undefined;
  return (...args: T) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  };
}

export function throttle<T extends Array<any>>(
  func: (...param: T) => void,
  delay: number,
) {
  let shouldWait = false;
  let waitingArgs: T | null = null;
  const timeoutFunc = () => {
    if (waitingArgs == null) {
      shouldWait = false;
    } else {
      func(...waitingArgs);
      waitingArgs = null;
      setTimeout(timeoutFunc, delay);
    }
  };

  return (...args: T) => {
    if (shouldWait) {
      waitingArgs = args;
      return;
    }

    func(...args);
    shouldWait = true;
    setTimeout(timeoutFunc, delay);
  };
}

/**
 * for extract message from params string array
 * @example params array:
 *   [
 *     "0x7ee0375a10acc7d0e3cdf1c21c9409be7a9dff7b",
 *     "0x4d7920656d61696c206973206a6f686e40646f652e636f6d202d2031363736363231313434323235"
 *   ]
 *
 *  [
 *     "0x4d7920656d61696c206973206a6f686e40646f652e636f6d202d2031363736363231313030303234",
 *     "0x7ee0375a10acc7d0e3cdf1c21c9409be7a9dff7b"
 *  ]
 */
export function getSignParamsMessage(params: string[]) {
  const message = params.filter(p => !utils.isAddress(p))[0];
  return Buffer.from(message.slice(2), 'hex').toString('utf8');
}

/**
 * Gets data from various signTypedData request methods by filtering out
 * a value that is not an address (thus is data).
 * If data is a string convert it to object
 */
export function getSignTypedDataParamsData(params: string[]) {
  const data = params.filter(p => !utils.isAddress(p))[0];

  if (typeof data === 'string') {
    return JSON.parse(data);
  }

  return data;
}

export const getWalletConnectAccountsFromSession = (
  session: SessionTypes.Struct,
): WalletConnectParsedAccount[] => {
  const accounts = Object.values(session?.namespaces).map(namespace => {
    // The namespace.accounts variable is a string array,
    // with each item formatted as follows: 'eip155:5:0x7ee0375a10acc7d0e3cdf1c21c9409be7a9dff7b'.
    return namespace?.accounts?.map(it => {
      const splitedItem = it?.split?.(':');
      let namespaceName: string | undefined,
        networkId: string | undefined,
        address: string | undefined;

      if (splitedItem?.length === 2) {
        namespaceName = splitedItem[0];
        address = splitedItem[1];
      } else if (splitedItem?.length === 3) {
        namespaceName = splitedItem[0];
        networkId = splitedItem[1];
        address = splitedItem[2];
      } else {
        // Get the last element because it is the wallet address.
        address = splitedItem?.[splitedItem?.length - 1];
      }

      return {namespace: namespaceName, networkId, address};
    });
  });

  return accounts.flat().filter(it => utils.isAddress(it.address));
};

export const groupAllSessionsAccouts = (sessions: SessionTypes.Struct[]) => {
  const accountsMap: Record<string, WalletConnectParsedAccount> = {};

  sessions.forEach(session => {
    const accounts = getWalletConnectAccountsFromSession(session);
    accounts.forEach(account => {
      accountsMap[account.address] = account;
    });
  });

  return Object.values(accountsMap);
};

export const filterWalletConnectSessionsByAddress = (
  sessions: SessionTypes.Struct[],
  address: string,
): SessionTypes.Struct[] => {
  return sessions?.filter?.(session => {
    return !!Object.values(session.namespaces).find(namespace => {
      return namespace.accounts?.find?.(account => account?.includes(address));
    });
  });
};

export const getUserAddressFromSessionRequest = (
  event: SignClientTypes.EventArguments['session_request'],
): string => {
  const request = event?.params?.request;

  switch (request?.method) {
    case EIP155_SIGNING_METHODS.PERSONAL_SIGN:
      return request.params?.[1];
    case EIP155_SIGNING_METHODS.ETH_SIGN:
    case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA:
    case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V3:
    case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V4:
      return request.params?.[0];
    case EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION:
    case EIP155_SIGNING_METHODS.ETH_SIGN_TRANSACTION:
      return request?.params?.[0]?.from;
    default:
      throw new Error(
        `[getUserAddressFromSessionRequest]: INVALID_METHOD ${request.method}`,
      );
  }
};

export const getHostnameFromUrl = (url: string | undefined) => {
  if (!url) {
    return '';
  }
  // run against regex
  const matches = url.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i);
  // extract hostname (will be null if no match is found)
  return matches?.[1] || '';
};

export const isValidUrl = (string: string) => {
  const pattern = new RegExp(
    '^(https?:\\/\\/)?' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR IP (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$', // fragment locator
    'i',
  );
  return pattern.test(string);
};

export const isI18N = (obj: any): obj is I18N => {
  return obj in I18N;
};

