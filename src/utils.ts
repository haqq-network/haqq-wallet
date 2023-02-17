import {PATTERNS_SOURCE} from '@env';
import {utils} from 'ethers';
import {Animated} from 'react-native';

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
