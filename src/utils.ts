/* eslint-disable no-bitwise */
import {ActionSheetProps} from '@expo/react-native-action-sheet';
import {formatNumberWithSubscriptZeros} from '@haqq/format-number-with-subscript-zeros/src';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {SessionTypes} from '@walletconnect/types';
import {
  differenceInDays,
  differenceInHours,
  differenceInMilliseconds,
  differenceInMinutes,
} from 'date-fns';
import Decimal from 'decimal.js';
import {ethers} from 'ethers';
import _ from 'lodash';
import {
  Alert,
  Animated,
  I18nManager,
  Linking,
  NativeModules,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import {Adjust} from 'react-native-adjust';
import prompt, {PromptOptions} from 'react-native-prompt-android';
import RNRestart from 'react-native-restart';

import {app} from '@app/contexts';
import {RemoteConfig} from '@app/services/remote-config';

import {Color, getColor} from './colors';
import {DEBUG_VARS} from './debug-vars';
import {Events} from './events';
import {AddressUtils} from './helpers/address-utils';
import {getRemoteMultiplierValue} from './helpers/get-remote-balance-value';
import {shortAddress} from './helpers/short-address';
import {getHost, onUrlSubmit} from './helpers/web3-browser-utils';
import {I18N, getText} from './i18n';
import {AppStore} from './models/app';
import {Banner, BannerButtonEvent, BannerType} from './models/banner';
import {Fee} from './models/fee';
import {BalanceModel, IWalletModel, WalletBalance} from './models/wallet';
import {navigator} from './navigator';
import {HomeStackRoutes, WelcomeStackRoutes} from './route-types';
import {Balance} from './services/balance';
import {EthSignError} from './services/eth-sign';
import {
  AddressEthereum,
  AdjustTrackingAuthorizationStatus,
  AppLanguage,
  EIPTypedData,
  EthType,
  EthTypedData,
  IndexerTransaction,
  IndexerTransactionWithType,
  IndexerTxMsgType,
  JsonRpcTransactionRequest,
  PartialJsonRpcRequest,
  SendTransactionError,
  WalletConnectParsedAccount,
} from './types';
import {
  DISTRIBUTION_ABI,
  ERC20_ABI,
  STAKING_ABI,
  V3SWAPROUTER_ABI,
  WETH_ABI,
} from './variables/abi';
import {IS_ANDROID, RTL_LANGUAGES, STORE_PAGE_URL} from './variables/common';
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

const ethAddressRegex = /(0x\w{2})(.*)(\w{4})$/m;
const cosmosAddressRegex = /(haqq|cosmos|kava|atom|axelar|evmos)(.*)(\w{4})$/m;
const haqqValidatorAddressRegex = /(haqqvaloper)(.*)(\w{4})$/m;
const tronAddressRegex = /(T)(.*)(\w{4})$/m;

export function splitAddress(address: string) {
  if (!address) {
    return [];
  }

  let regex = ethAddressRegex;

  if (AddressUtils.isTronAddress(address)) {
    regex = tronAddressRegex;
  }

  if (AddressUtils.isHaqqAddress(address)) {
    regex = cosmosAddressRegex;
  }

  if (AddressUtils.isHaqqValidatorAddress(address)) {
    regex = haqqValidatorAddressRegex;
  }

  regex.lastIndex = 0;
  const result = regex.exec(address);
  if (!result) {
    const comsosResult = cosmosAddressRegex.exec(address);
    if (comsosResult) {
      return [comsosResult[1], comsosResult[2], comsosResult[3]];
    }
    const length = address.length;
    const firstPart = address.slice(0, 4);
    const middlePart = address.slice(4, length - 4);
    const lastPart = address.slice(length - 4, length);

    return [firstPart, middlePart, lastPart];
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
  return `${RemoteConfig.get('pattern_source')}${pattern}@3x.png`;
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

    if (AppStore.isDeveloperModeEnabled) {
      Logger.log(new Date(), 'event started', tx, func.name, ...args);
    }

    func(...args).then(() => {
      callback();
      if (AppStore.isDeveloperModeEnabled) {
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
  const message = params.filter(p => !AddressUtils.isEthAddress(p) && !!p)[0];
  const parsedMessage = message?.startsWith('0x') ? message.slice(2) : message;

  if (isValidJSON(parsedMessage)) {
    return parsedMessage;
  }

  const utf8 = Buffer.from(parsedMessage, 'hex').toString('utf8');
  return utf8 || parsedMessage;
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
    const data = params.filter(p => !AddressUtils.isEthAddress(p))[0];
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

  return accounts.flat().filter(it => AddressUtils.isEthAddress(it.address));
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
  const matches = url.match(/^https?:\/\/([^/?#]+)(?:[/?#]|$)/i);
  // extract hostname (will be null if no match is found)
  return matches?.[1] || '';
};

export const isValidUrl = (string: string) => {
  const pattern = new RegExp(
    '^(https?:\\/\\/)?' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR IP (v4) address
      '(\\/[\\@\\-a-zA-Z\\d%_.~+\\,]*)*' + // port and path
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
): jsonString is string & object {
  try {
    if (
      !jsonString ||
      typeof jsonString !== 'string' ||
      !jsonString.startsWith('{')
    ) {
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

export function isSendTransactionError(err: any): err is SendTransactionError {
  const e = err as SendTransactionError;
  return typeof e?.transaction?.to === 'string' && typeof e.code === 'string';
}

export function isAbortControllerError(err: any): err is Error {
  return isError(err) && err.name === 'AbortError';
}

export function isEthSignError(err: any): err is EthSignError {
  return err?.name === 'EthSignError';
}

export interface InAppBrowserOptions {
  title?: string;
  onPageLoaded?: (isError: boolean | undefined) => void;
}

export const openInAppBrowser = (
  url: string,
  options?: InAppBrowserOptions,
) => {
  const {screenName, formattedUrl, title} = prepareDataForInAppBrowser(
    url,
    options,
  );

  navigator.navigate(screenName, {
    url: formattedUrl,
    title,
  });
};

export const prepareDataForInAppBrowser = (
  url: string,
  options?: InAppBrowserOptions,
) => {
  const {onPageLoaded} = options || {};
  const eventId = `${Events.openInAppBrowserPageLoaded}-${url}`;

  if (onPageLoaded) {
    app.once(eventId, onPageLoaded);
  }

  const screenName:
    | HomeStackRoutes.InAppBrowser
    | WelcomeStackRoutes.InAppBrowser = AppStore.isOnboarded
    ? HomeStackRoutes.InAppBrowser
    : WelcomeStackRoutes.InAppBrowser;

  return {
    ...options,
    formattedUrl: onUrlSubmit(url),
    eventId,
    screenName,
  };
};

export const openWeb3Browser = (url: string) => {
  navigator.navigate('web3BrowserPopup', {
    url: onUrlSubmit(url),
    popup: true,
  });
};

export const requestTrackingAuthorization = () => {
  if (IS_DETOX) {
    return Promise.resolve(
      AdjustTrackingAuthorizationStatus.userDeviceRestricted,
    );
  }
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

export async function requestCameraPermissions(): Promise<boolean> {
  const CameraManager =
    NativeModules.RNCameraManager || NativeModules.RNCameraModule;
  if (Platform.OS === 'ios') {
    return await CameraManager.checkVideoAuthorizationStatus();
  } else if (Platform.OS === 'android') {
    const cameraPermissionResult = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
    );
    return cameraPermissionResult === PermissionsAndroid.RESULTS.GRANTED;
  }
  return false;
}

export async function fetchWithTimeout(
  input: RequestInfo,
  init?: RequestInit & {timeout?: number},
): Promise<Response> {
  const {timeout = 30000, ...opts} = init || {};
  const controller = new AbortController();
  const id = setTimeout(() => {
    if (timeout > 0) {
      controller.abort();
    }
  }, timeout);
  const response = await fetch(input, {
    ...opts,
    signal: controller.signal,
  });
  clearTimeout(id);
  return response;
}

export const decimalToHex = (value: string) => new Decimal(value).toHex();
export const stringToHex = (value: string) =>
  Buffer.from(value, 'utf8').toString('hex');
export const hexToString = (value: string) =>
  Buffer.from(value, 'hex').toString('utf8');

export const getTransactionFromJsonRpcRequest = (
  request: PartialJsonRpcRequest,
  fee?: Fee | null,
): Partial<JsonRpcTransactionRequest> | undefined => {
  if (
    [
      EIP155_SIGNING_METHODS.ETH_SIGN_TRANSACTION,
      EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION,
    ].includes(request.method as EIP155_SIGNING_METHODS)
  ) {
    const params: Partial<JsonRpcTransactionRequest> = Array.isArray(
      request.params,
    )
      ? request.params[0]
      : request.params;

    // @ts-ignore
    if (params.gas) {
      // @ts-ignore
      params.gasPrice = params.gas;
      // @ts-ignore
      delete params.gas;
    }

    if (fee) {
      params.gasLimit = fee.gasLimit?.toHex();
      params.maxPriorityFeePerGas = fee.maxPriorityFee?.toHex();
      params.maxFeePerGas = fee.maxBaseFee?.toHex();
    }

    return params;
  }
};

export function isContractTransaction(
  tx: {to?: AddressEthereum | string; data?: string} | undefined | null,
): boolean {
  if (!tx || !tx.to || !AddressUtils.isEthAddress(tx.to)) {
    return false;
  }

  if (tx.data && tx.data !== '0x' && !/^0x0+$/.test(tx.data)) {
    return true;
  }

  return false;
}

export const calculateBalances = (
  data: WalletBalance,
  wallets: IWalletModel[],
): BalanceModel => {
  const balance = new BalanceModel({
    staked: Balance.Empty,
    vested: Balance.Empty,
    available: Balance.Empty,
    total: Balance.Empty,
    locked: Balance.Empty,
    availableForStake: Balance.Empty,
    unlock: new Date(0),
  });

  wallets.forEach(wallet => {
    const {available, locked, staked, total, vested, availableForStake} =
      data[wallet.address] ?? {};

    balance.addStaked(staked);
    balance.addVested(vested);
    balance.addAvailable(available);
    balance.addTotal(total);
    balance.addLocked(locked);
    balance.addAvailableForState(availableForStake);
  });

  return balance;
};

export const generateMockBanner = (): Banner => {
  const id = generateUUID();

  return {
    id,
    type: BannerType.test,
    title: `Mock Banner Title ${shortAddress(id)}`,
    description: 'Mock Banner Description',
    buttons: [
      {
        id: new Realm.BSON.UUID(),
        title: 'Button Title',
        event: BannerButtonEvent.test,
        params: {banner_id: id, type: 'button press event'},
        color: 'textBase1',
        backgroundColor: 'bg1',
      },
    ],
    titleColor: 'textBase1',
    descriptionColor: 'textBase1',
    backgroundColorFrom: '#1B6EE5',
    backgroundColorTo: '#2C8EEB',
    backgroundBorder: 'bg4',
    closeButtonColor: 'textRed1',
    isUsed: false,
    snoozedUntil: new Date(),
    defaultEvent: BannerButtonEvent.test,
    defaultParams: {banner_id: id, type: 'default event'},
    closeEvent:
      Math.random() > 0.5 ? BannerButtonEvent.none : BannerButtonEvent.test,
    closeParams: {banner_id: id, type: 'close event'},
    priority: 1,
  };
};

export const showUnrecognizedDataAttention = () =>
  Alert.alert(getText(I18N.unknownError), getText(I18N.unrecognizedDataFormat));

export const requestQRScannerPermission = (url: string) =>
  new Promise<boolean>(resolve => {
    Alert.alert(
      getText(I18N.qrPermissionRequest),
      getText(I18N.qrPermissionRequestDescription, {ur: getHost(url)}),
      [
        {
          text: getText(I18N.cancel),
          onPress: () => resolve(false),
          style: 'cancel',
        },
        {
          text: getText(I18N.accept),
          onPress: () => resolve(true),
        },
      ],
      {cancelable: false},
    );
  });

export const getRandomItemFromArray = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array?.length)] as T;
};

export const uppercaseFirtsLetter = (str: string) =>
  str
    .toLowerCase()
    // uppercase first letter
    .replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());

export function promtAsync(
  title?: string,
  message?: string,
  options?: PromptOptions,
): Promise<string> {
  return new Promise(resolve => {
    prompt(title, message, resolve, options);
  });
}

/**
 * wrap for typescript indexet TX type
 */
export function wrapIndexerTx<T extends IndexerTxMsgType>(
  tx: IndexerTransaction,
) {
  return tx as IndexerTransactionWithType<T>;
}

export function applyEthTxMultiplier(toBalance: Balance) {
  // TODO Investigate and fix new Balance issue when number used instead of hex
  return new Balance(
    decimalToHex(
      String(
        // Convert to int because decimalToHex incorrectly parse decimals work only with integers
        parseInt(
          String(
            // Multiply by eth_commission_multiplier
            toBalance.toNumber() *
              getRemoteMultiplierValue('eth_commission_multiplier'),
          ),
          10,
        ),
      ),
    ),
  );
}

export function parseTxDataFromHexInput(hex?: string) {
  if (!hex) {
    return undefined;
  }
  let data = hex;
  if (!hex.startsWith('0x')) {
    data = `0x${hex}`;
  }

  // try to parse as a ERC20 contract call
  try {
    return new ethers.utils.Interface(ERC20_ABI).parseTransaction({data: data});
  } catch (e) {}

  // try to parse as a swap transaction
  try {
    return new ethers.utils.Interface(V3SWAPROUTER_ABI).parseTransaction({
      data: data,
    });
  } catch (e) {}

  // try to parse as a wrap/unwrap transaction
  try {
    return new ethers.utils.Interface(WETH_ABI).parseTransaction({
      data: data,
    });
  } catch (e) {}

  try {
    return new ethers.utils.Interface(DISTRIBUTION_ABI).parseTransaction({
      data: data,
    });
  } catch (e) {}

  try {
    return new ethers.utils.Interface(STAKING_ABI).parseTransaction({
      data: data,
    });
  } catch (e) {}

  return undefined;
}

const SUPPORTED_COSMOS_TX_TYPE_FOR_RENDER = [
  IndexerTxMsgType.msgDelegate,
  IndexerTxMsgType.msgUndelegate,
  IndexerTxMsgType.msgBeginRedelegate,
  IndexerTxMsgType.msgWithdrawDelegationReward,
].map(s => s.toLowerCase());

export function isSupportedCosmosTxForRender(
  tx?: any | EIPTypedData,
): tx is EIPTypedData {
  if (!tx && typeof tx !== 'object') {
    return false;
  }

  if (
    'domain' in tx &&
    'message' in tx &&
    // @ts-ignore
    tx.domain?.verifyingContract === 'cosmos'
  ) {
    // @ts-ignore
    const firstMessage = tx.message?.msgs?.[0] as any;
    if (!firstMessage) {
      return false;
    }
    const msgType = firstMessage['@type'] || firstMessage.type;

    let isSupportedType = false;
    SUPPORTED_COSMOS_TX_TYPE_FOR_RENDER.forEach(type => {
      if (msgType.toLowerCase().includes(type)) {
        isSupportedType = true;
      }
    });
    return isSupportedType;
  }
  return false;
}

export const IS_RTL_ENABLED_KEY = 'is_rtl_enabled';
export const setRTL = async (lang: AppLanguage) => {
  const isRTL = RTL_LANGUAGES.includes(lang);

  const isRTLenabled =
    (await AsyncStorage.getItem(IS_RTL_ENABLED_KEY)) === 'true';

  I18nManager.allowRTL(isRTL);
  I18nManager.forceRTL(isRTL);
  I18nManager.swapLeftAndRightInRTL(isRTL);

  await AsyncStorage.setItem(IS_RTL_ENABLED_KEY, isRTL.toString());

  if (isRTL !== isRTLenabled) {
    RNRestart.restart();
  }
};
const hexRegExp = /^(0[xX])?[0-9A-Fa-f]+$/;
export function isValidHex(hexString: string) {
  return hexRegExp.test(hexString);
}

export const formatNumberString = (value: string, precision = 3) =>
  formatNumberWithSubscriptZeros(value, precision);

/**
 * Represents a function that returns a Promise.
 *
 * @template T The type of the value resolved by the promise.
 * @returns {Promise<T>} A promise that resolves to a value of type T.
 */
export type AsyncTaskFunction<T> = (...args: any) => Promise<T>;

/**
 * Creates a singleton version of an asynchronous task. The task will be
 * executed only once at a time, even if called multiple times concurrently.
 *
 * If multiple calls are made before the task finishes, all calls will return
 * the same result. Once the task is complete, the next call will execute it again.
 *
 * @template T The type of the value resolved by the task's promise.
 *
 * @param {AsyncTaskFunction<T>} fn The asynchronous function to be executed.
 * @returns {AsyncTaskFunction<T>} A new asynchronous function that will only
 * run once at a time. It resets after the task finishes.
 *
 * @example
 * // Example usage
 * const task = async () => {
 *   console.log('Task executed');
 *   return 'Task Result';
 * };
 *
 * const singletonTask = createSingletonTask(task);
 *
 * // Calling multiple times in quick succession will only execute the task once.
 * singletonTask().then(console.log); // Output: 'Task executed', 'Task Result'
 * singletonTask().then(console.log); // Output: 'Task Result'
 *
 * // After the task finishes, calling it again will execute the task again.
 * setTimeout(() => {
 *   singletonTask().then(console.log); // Output: 'Task executed', 'Task Result'
 * }, 2000);
 */
export function createAsyncTask<T>(fn: AsyncTaskFunction<T>) {
  let instance: Promise<T> | null = null;

  return async function (...args: Parameters<typeof fn>): Promise<T> {
    if (!instance) {
      instance = fn(...args);
    }
    return instance.finally(() => (instance = null));
  };
}

export const deepClone = (value?: Object) => {
  if (!value) {
    return value;
  }

  return JSON.parse(JSON.stringify(value));
};

export const requestMockTxActionSheet = async ({
  showActionSheetWithOptions,
}: ActionSheetProps): Promise<PartialJsonRpcRequest> => {
  return new Promise(resolve => {
    showActionSheetWithOptions(
      {
        options: [
          'Cancel',
          'eth_sendTransaction',
          'eth_signTransaction',
          'personal_sign',
          'eth_signTypedData_v4',
          'Sign in with Ethereum',
        ],
        cancelButtonIndex: 0,
        destructiveButtonIndex: 0,
        title: 'Choose action',
      },
      index => {
        let tx = {} as PartialJsonRpcRequest;
        //eth_sendTransaction and eth_signTransaction
        if (index === 1 || index === 2) {
          tx = {
            method: index === 1 ? 'eth_sendTransaction' : 'eth_signTransaction',
            params: [
              {
                value: '1000000',
                to: 'TXtLUKcumR3TNpCcCzr4tjjkpKpMeJ5H66',
              },
            ],
          };
        }
        // personal_sign
        if (index === 3) {
          tx = {
            method: 'personal_sign',
            params: [
              '0x415b829d862121f25fcdfdfadf7a705e45249dbc',
              'Hello HAQQ Wallet!',
            ],
          };
        }

        // eth_signTypedData_v4
        if (index === 4) {
          tx = {
            method: 'eth_signTypedData_v4',
            params: [
              '0x1bb71b571a16eed293d931d245f43d2a1d341759',
              {
                types: {
                  EIP712Domain: [
                    {
                      name: 'name',
                      type: 'string',
                    },
                    {
                      name: 'version',
                      type: 'string',
                    },
                    {
                      name: 'chainId',
                      type: 'uint256',
                    },
                    {
                      name: 'verifyingContract',
                      type: 'string',
                    },
                    {
                      name: 'salt',
                      type: 'string',
                    },
                  ],
                  Tx: [
                    {
                      name: 'account_number',
                      type: 'string',
                    },
                    {
                      name: 'chain_id',
                      type: 'string',
                    },
                    {
                      name: 'fee',
                      type: 'Fee',
                    },
                    {
                      name: 'memo',
                      type: 'string',
                    },
                    {
                      name: 'msgs',
                      type: 'Msg[]',
                    },
                    {
                      name: 'sequence',
                      type: 'string',
                    },
                  ],
                  Fee: [
                    {
                      name: 'feePayer',
                      type: 'string',
                    },
                    {
                      name: 'amount',
                      type: 'Coin[]',
                    },
                    {
                      name: 'gas',
                      type: 'string',
                    },
                  ],
                  Coin: [
                    {
                      name: 'denom',
                      type: 'string',
                    },
                    {
                      name: 'amount',
                      type: 'string',
                    },
                  ],
                  Msg: [
                    {
                      name: 'type',
                      type: 'string',
                    },
                    {
                      name: 'value',
                      type: 'MsgValue',
                    },
                  ],
                  MsgValue: [
                    {
                      name: 'delegator_address',
                      type: 'string',
                    },
                    {
                      name: 'validator_address',
                      type: 'string',
                    },
                    {
                      name: 'amount',
                      type: 'TypeAmount',
                    },
                  ],
                  TypeAmount: [
                    {
                      name: 'denom',
                      type: 'string',
                    },
                    {
                      name: 'amount',
                      type: 'string',
                    },
                  ],
                },
                primaryType: 'Tx',
                domain: {
                  name: 'Cosmos Web3',
                  version: '1.0.0',
                  chainId: 11235,
                  verifyingContract: 'cosmos',
                  salt: '0',
                },
                message: {
                  account_number: '3239277',
                  chain_id: 'haqq_11235-1',
                  fee: {
                    amount: [
                      {
                        amount: '181336045000000000',
                        denom: 'aISLM',
                      },
                    ],
                    gas: '6594038',
                    feePayer: 'haqq1rwm3k4c6zmhd9y7ex8fytapa9gwng96eapx3ek',
                  },
                  memo: '',
                  msgs: [
                    {
                      type: 'cosmos-sdk/MsgDelegate',
                      value: {
                        amount: {
                          amount: '1000000000000000000',
                          denom: 'aISLM',
                        },
                        delegator_address:
                          'haqq1rwm3k4c6zmhd9y7ex8fytapa9gwng96eapx3ek',
                        validator_address:
                          'haqqvaloper16hy887wxzjmmkkfrdxzgz9dlv6mfru56q539cw',
                      },
                    },
                  ],
                  sequence: '1',
                },
              },
            ],
          };
        }

        // Sign in with Ethereum
        if (index === 5) {
          tx = {
            method: 'personal_sign',
            params: [
              '0x415b829d862121f25fcdfdfadf7a705e45249dbc',
              `HAQQ Wallet wants you to sign in with your Ethereum account:
  0x415b829d862121f25fcdfdfadf7a705e45249dbc
  
  This is a test statement.
  
  URI: https://test.test/login
  Version: 1
  Chain ID: 11235
  Nonce: 1234567890
  Issued At: 2024-02-20T12:00:00.000Z`,
            ],
          };
        }

        resolve(tx);
      },
    );
  });
};
