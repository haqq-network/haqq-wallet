import {PATTERNS_SOURCE} from '@env';
import {SessionTypes} from '@walletconnect/types';
import {
  differenceInDays,
  differenceInHours,
  differenceInMilliseconds,
  differenceInMinutes,
} from 'date-fns';
import {utils} from 'ethers';
import _ from 'lodash';
import {Animated, Linking} from 'react-native';
import {Adjust} from 'react-native-adjust';

import {app} from '@app/contexts';

import {Color, getColor} from './colors';
import {DEBUG_VARS} from './debug-vars';
import {Events} from './events';
import {onUrlSubmit} from './helpers/web3-browser-utils';
import {I18N} from './i18n';
import {navigator} from './navigator';
import {
  AdjustTrackingAuthorizationStatus,
  EthType,
  EthTypedData,
  PartialJsonRpcRequest,
  WalletConnectParsedAccount,
} from './types';
import {IS_ANDROID, STORE_PAGE_URL} from './variables/common';
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
    const r = (Math.random() * 16) | 0,
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

export function callbackWrapper<T extends Array<any>>(
  func: (...param: T) => Promise<void>,
) {
  return (...args: T) => {
    const callback =
      typeof args[args.length - 1] === 'function' ? args.pop() : () => {};

    const tx = makeID(5);

    if (app.isDeveloper) {
      Logger.log(new Date(), 'event started', tx, func.name, ...args);
    }

    func(...args).then(() => {
      callback();
      if (app.isDeveloper) {
        Logger.log(new Date(), 'event finished', tx, func.name);
      }
    });
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

function removeUnusedTypes(typedData: EthTypedData): EthTypedData {
  const types = typedData.types;
  const primaryTypes = [typedData.primaryType, 'EIP712Domain'];

  // Find all the primary types used in the message
  findPrimaryTypes(typedData.message, types, primaryTypes);

  // Remove unused types and ambiguous primary types
  const newTypes: {[key: string]: EthType} = {};
  primaryTypes.forEach(primaryType => {
    if (types[primaryType]) {
      newTypes[primaryType] = types[primaryType];
      findReferencedTypes(types[primaryType], types, newTypes);
    }
  });

  // Create a new typed data object with the updated types
  return {
    domain: typedData.domain,
    message: typedData.message,
    primaryType: typedData.primaryType,
    types: newTypes,
  };
}

function findPrimaryTypes(
  message: {[key: string]: any},
  types: {[key: string]: EthType},
  primaryTypes: string[],
) {
  // Find all the primary types used in the message
  const typeNames = Object.keys(types);
  typeNames.forEach(typeName => {
    if (message[typeName]) {
      primaryTypes.push(typeName);
      findPrimaryTypes(message[typeName], types, primaryTypes);
    }
  });
}

function findReferencedTypes(
  type: EthType,
  types: {[key: string]: EthType},
  newTypes: {[key: string]: EthType},
) {
  // Find all the types referenced by a given type
  const fieldTypes = Object.values(type);
  fieldTypes.forEach(fieldType => {
    if (typeof fieldType === 'object') {
      // @ts-ignore
      const typeName = fieldType.type?.replace?.('[]', '');
      if (types[typeName] && !newTypes[typeName]) {
        newTypes[typeName] = types[typeName];
        findReferencedTypes(types[typeName], types, newTypes);
      }
    }
  });
}

/**
 * Gets data from various signTypedData request methods by filtering out
 * a value that is not an address (thus is data).
 * If data is a string convert it to object
 */
export function getSignTypedDataParamsData(
  params: string[],
): EthTypedData | null {
  try {
    const data = params.filter(p => !utils.isAddress(p))[0];
    if (typeof data === 'string') {
      return removeUnusedTypes(JSON.parse(data));
    } else {
      return removeUnusedTypes(data);
    }
  } catch (e) {}
  return null;
}

export function isEthTypedData(data: any): data is EthTypedData {
  return (
    data && data.domain && data.message && data.types && data.types.EIP712Domain
  );
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

export const getUserAddressFromJRPCRequest = (
  request: PartialJsonRpcRequest,
): string | null => {
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
      Logger.captureException(
        {
          message: `INVALID_METHOD ${request.method}`,
        },
        'getUserAddressFromSessionRequest',
        {request},
      );
      return null;
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

interface CalculateEstimateTimeParams {
  endDate: number | Date;
  startDate?: number | Date;
  currentDate?: number | Date;
}

export const calculateEstimateTime = _.memoize(
  ({
    endDate,
    startDate = Date.now(),
    currentDate = Date.now(),
  }: CalculateEstimateTimeParams) => {
    const milliseconds = Math.max(
      0,
      differenceInMilliseconds(endDate, currentDate) % 60000,
    );
    const seconds = Math.max(0, Math.floor(milliseconds / 1000) + 1);
    const minutes = Math.max(0, differenceInMinutes(endDate, currentDate) % 60);
    const hours = Math.max(0, differenceInHours(endDate, currentDate) % 24);
    const days = Math.max(0, differenceInDays(endDate, currentDate));
    const secondsFormatted = String(seconds).padStart(2, '0');
    const minutesFormatted = String(minutes).padStart(2, '0');
    const hoursFormatted = String(hours).padStart(2, '0');
    const daysFormatted = String(days).padStart(2, '0');

    const elapsedTime = differenceInMilliseconds(currentDate, startDate);
    const duration = differenceInMilliseconds(endDate, startDate);
    const progress = elapsedTime / duration;

    return {
      // Remaining time in milliseconds. It shows the part of a minute left.
      milliseconds,
      // Remaining time in seconds. It is calculated from the remaining milliseconds.
      seconds,
      secondsFormatted,
      // Remaining time in minutes. It's calculated from the remaining total time, and it shows the part of an hour left.
      minutes,
      minutesFormatted,
      // Remaining time in hours. It's calculated from the remaining total time, and it shows the part of a day left.
      hours,
      hoursFormatted,
      // Remaining time in days. It's calculated from the remaining total time.
      days,
      daysFormatted,
      // Elapsed time in milliseconds. It shows how much time has passed since the start.
      elapsedTime,
      // Total duration of the timer in milliseconds. It shows how much time in total the timer was set for from start to end.
      duration,
      // Progress of the timer. It's a value between 0 and 1 showing the proportion of elapsed time to the total duration.
      progress,
    };
  },
);

export const calculateEstimateTimeString = _.memoize(
  (params: CalculateEstimateTimeParams) => {
    const {
      days,
      daysFormatted,
      hours,
      hoursFormatted,
      minutes,
      minutesFormatted,
      seconds,
      secondsFormatted,
    } = calculateEstimateTime(params);

    if (days > 0) {
      return `${daysFormatted}d ${hoursFormatted}h ${minutesFormatted}m`;
    }

    if (hours > 0) {
      return `${hoursFormatted}h ${minutesFormatted}m`;
    }

    if (minutes > 0) {
      return `${minutesFormatted}m`;
    }

    if (seconds > 0) {
      return `00m ${secondsFormatted}s`;
    }

    return 'Invalid date';
  },
);

export function getBase64ImageSource(base64: string, extension = 'png') {
  if (base64.substring(0, 5) !== 'data:') {
    base64 = `data:image/${extension};base64,` + base64;
  }
  return {uri: base64};
}

export const promiseLogger = async (tag: string, promise: Promise<any>) => {
  try {
    const result = await promise;
    Logger.log(
      `⚪️ [promiseLogger] ${tag}: `,
      JSON.stringify({result}, null, 2),
    );
    return result;
  } catch (e) {
    Logger.warn(`Failed to get promise data: ${tag} `);
  }
};

export async function getHttpResponse<T = any>(
  response: Response,
  method: 'json' | 'text' | 'blob' | 'arrayBuffer' = 'json',
): Promise<T> {
  try {
    return (await response[method]()) as T;
  } catch (e) {
    Logger.error(`🔴 [getHttpResponse] ${e} ${response.url}`);
    if (DEBUG_VARS.enableHttpErrorDetails) {
      promiseLogger('getHttpResponse: text', response.clone().text());
      promiseLogger('getHttpResponse: blob', response.clone().blob());
      promiseLogger(
        'getHttpResponse: arrayBuffer',
        response.clone().arrayBuffer(),
      );
      promiseLogger('getHttpResponse: json', response.clone().json());
    }
    return {} as T;
  }
}

export function addOpacityToHEX(color: string, value: number) {
  const opacity = Math.floor(value * 255).toString(16);
  const str = color.toString();
  return str + opacity;
}

export function addOpacityToColor(color: Color, value: number) {
  return addOpacityToHEX(getColor(color), value);
}

export enum SortDirectionEnum {
  ascending = 'asc',
  descending = 'desc',
}

export type SortUtilFunction<T> = (a: T, b: T) => number;

export function arraySortUtil<T>(
  sortDirection: SortDirectionEnum,
  fieldName: keyof T,
): SortUtilFunction<T> {
  return (a: T, b: T) => {
    const aValue = a[fieldName];
    const bValue = b[fieldName];

    if (aValue < bValue) {
      return sortDirection === SortDirectionEnum.ascending ? -1 : 1;
    } else if (aValue > bValue) {
      return sortDirection === SortDirectionEnum.ascending ? 1 : -1;
    } else {
      return 0;
    }
  };
}

export function isValidJSON(
  jsonString: string | undefined,
): jsonString is string {
  try {
    if (!jsonString) {
      return false;
    }
    JSON.parse(jsonString);
  } catch (e) {
    return false;
  }
  return true;
}

export function isError(err: any): err is Error {
  return err instanceof Error || typeof err?.message === 'string';
}

export function isAbortControllerError(err: any): err is Error {
  return isError(err) && err.name === 'AbortError';
}

export interface InAppBrowserOptions {
  title?: string;
  onPageLoaded?: () => void;
}

export const openInAppBrowser = (
  url: string,
  options?: InAppBrowserOptions,
) => {
  const {title, onPageLoaded} = options || {};
  const eventId = `${Events.openInAppBrowserPageLoaded}-${url}`;
  if (onPageLoaded) {
    app.once(eventId, onPageLoaded);
  }
  navigator.navigate('inAppBrowser', {
    url: onUrlSubmit(url),
    title,
  });
};

export const openWeb3Browser = (url: string) => {
  navigator.navigate('web3BrowserPopup', {url: onUrlSubmit(url), popup: true});
};

export const requestTrackingAuthorization = () => {
  return new Promise<AdjustTrackingAuthorizationStatus>(resolve => {
    if (IS_ANDROID) {
      return resolve(AdjustTrackingAuthorizationStatus.statusNotAvailable);
    }
    Adjust.requestTrackingAuthorizationWithCompletionHandler(
      (status: AdjustTrackingAuthorizationStatus) => {
        resolve(status);
      },
    );
  });
};

export const getAppTrackingAuthorizationStatus = () => {
  return new Promise<AdjustTrackingAuthorizationStatus>(resolve => {
    if (IS_ANDROID) {
      return resolve(AdjustTrackingAuthorizationStatus.statusNotAvailable);
    }
    Adjust.getAppTrackingAuthorizationStatus(
      (status: AdjustTrackingAuthorizationStatus) => {
        resolve(status);
      },
    );
  });
};

export async function openStorePage() {
  try {
    await Linking.openURL(STORE_PAGE_URL);
    return true;
  } catch (err) {
    Logger.captureException(err, 'utils:openStorePage');
    return false;
  }
}
