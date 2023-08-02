/* eslint-disable no-console */
import * as Sentry from '@sentry/react-native';

interface LoggerOptions {
  stringifyJson?: boolean;
  emodjiPrefix?: '🟢' | '🔵' | '🟣' | '🔴' | '⚪️' | '🟡' | '🟠' | '🟤' | '⚫️';
}

const BG_GREEN_TEXT_WHITE_BOLD = __DEV__ ? '\x1b[42m\x1b[37m\x1b[1m' : '';
const RESET = __DEV__ ? '\x1b[0m' : '';
export class LoggerService {
  private _tag?: string = '';
  private _stringifyJson?: boolean;
  private _emodji?: string;

  public get emodji() {
    return this._emodji || '';
  }

  public get tag() {
    if (this._tag) {
      return `${this.emodji} ${BG_GREEN_TEXT_WHITE_BOLD}[ ${this._tag} ]${RESET}`;
    }
    return `${this.emodji}`;
  }

  constructor(tag?: string, options?: LoggerOptions) {
    this._tag = tag;
    this._stringifyJson = options?.stringifyJson;
    this._emodji = options?.emodjiPrefix;
  }

  create(tag: string, options?: LoggerOptions) {
    return new LoggerService(tag, options);
  }

  log(...args: any[]) {
    console.log(this.tag, ...this._prepareArgs(...args));
  }

  warn(...args: any[]) {
    console.warn(this.tag, ...this._prepareArgs(...args));
  }

  error(...args: any[]) {
    console.error(this.tag, ...this._prepareArgs(...args));
  }

  trace(message?: any, ...optionalParams: any[]) {
    console.trace(message, ...optionalParams);
  }

  captureException(
    error: unknown,
    source: string = 'unknown',
    context: any = {},
  ) {
    if (!error) {
      this.log(
        source,
        'captureException called with missing or incorrect arguments',
      );
      this.trace();
      return;
    }
    this.error('captureException', source, error, context);
    try {
      Sentry.captureException(error, {
        tags: {source},
        extra: context,
      });
    } catch (e) {
      this.error(
        'captureException send error',
        source,
        error,
        context,
        // @ts-ignore
        e.message,
      );
    }
  }

  private _prepareArgs(...args: any[]) {
    if (this._stringifyJson) {
      return args.map(arg => {
        try {
          return JSON.stringify(arg, null, 2);
        } catch (e) {
          return arg;
        }
      });
    }
    return args;
  }
}
