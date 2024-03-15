/* eslint-disable no-console */
import * as Sentry from '@sentry/react-native';
interface LoggerOptions {
  stringifyJson?: boolean;
  emodjiPrefix?: '🟢' | '🔵' | '🟣' | '🔴' | '⚪️' | '🟡' | '🟠' | '🟤' | '⚫️';
  /**
   *  @default enabled true
   */
  enabled?: boolean;
}

const BG_GREEN_TEXT_WHITE_BOLD = __DEV__ ? '\x1b[42m\x1b[37m\x1b[1m' : '';
const RESET = __DEV__ ? '\x1b[0m' : '';
const ALLOWED_TAGS_PRIMITIVE_TYPES = [
  'number',
  'string',
  'boolean',
  'bigint',
  'symbol',
];
export class LoggerService {
  private _enabled?: boolean;
  private _stringifyJson?: boolean;
  private _tag?: string = '';
  private _emodji?: string;

  constructor(tag?: string, options?: LoggerOptions) {
    this._tag = tag;
    this._stringifyJson = options?.stringifyJson;
    this._emodji = options?.emodjiPrefix;
    this._enabled = options?.enabled ?? true;
  }

  public get emodji() {
    return this._emodji || '';
  }

  public get tag() {
    if (this._tag) {
      return `${this.emodji} ${BG_GREEN_TEXT_WHITE_BOLD}[ ${this._tag} ]${RESET}`;
    }
    return `${this.emodji}`;
  }

  create(tag: string, options?: LoggerOptions) {
    return new LoggerService(tag, options);
  }

  log(...args: any[]) {
    if (this._enabled) {
      console.log(this.tag, ...this._prepareArgs(...args));
    }
  }

  warn(...args: any[]) {
    if (this._enabled) {
      console.warn(this.tag, ...this._prepareArgs(...args));
    }
  }

  error(...args: any[]) {
    if (this._enabled) {
      console.error(this.tag, ...this._prepareArgs(...args));
    }
  }

  trace(message?: any, ...optionalParams: any[]) {
    if (this._enabled) {
      console.trace(message, ...optionalParams);
    }
  }

  captureException(
    error: unknown,
    source: string = 'unknown',
    context: Record<string, any> = {},
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
      Sentry.captureException(error, scope => {
        scope.clear();
        scope.setTag('source', source);
        scope.setTag('tag', this._tag);

        Object.entries(context).forEach(([key, value]) => {
          if (ALLOWED_TAGS_PRIMITIVE_TYPES.includes(typeof value)) {
            const k = key === 'id' || key === 'errorId' ? 'error_id' : key;
            scope.setTag(k, value);
          } else if (Array.isArray(value)) {
            scope.setContext(key, {value});
          } else {
            scope.setContext(key, value);
          }
        });

        return scope;
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
