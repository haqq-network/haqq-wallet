/* eslint-disable no-console */
import * as Sentry from '@sentry/react-native';

export class LoggerService {
  private _tag?: string = '';
  private _stringifyJson?: boolean;

  public get tag() {
    if (this._tag) {
      return `[ ${this._tag} ]`;
    }
    return '';
  }

  constructor(tag?: string, stringifyJson?: boolean) {
    this._tag = tag;
    this._stringifyJson = stringifyJson;
  }

  create(tag: string, stringifyJson?: boolean) {
    return new LoggerService(tag, stringifyJson);
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
      Logger.log(
        source,
        'captureException called with missing or incorrect arguments',
      );
      Logger.trace();
      return;
    }
    Logger.error('captureException', source, error, context);
    try {
      Sentry.captureException(error, {
        tags: {source},
        extra: context,
      });
    } catch (e) {
      Logger.error(
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
