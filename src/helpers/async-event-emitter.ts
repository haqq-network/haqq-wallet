import EventEmitter from 'events';

import {app} from '@app/contexts';
import {DEBUG_VARS} from '@app/debug-vars';
import {makeID} from '@app/utils';

import {EventResolverSymbol} from './await-for-event-done';

const logger = Logger.create('AsyncEventEmitter');

/**
 * Class representing an async event emitter.
 * This class extends Node.js' EventEmitter, adding the ability to work with async event listeners.
 *
 * @class
 * @extends {EventEmitter}
 *
 * @example
 * // Import required classes and functions
 * import {AsyncEventEmitter} from './async-event-emitter';
 * import {awaitForEventDone} from './await-for-event-done';
 *
 * // Create a new async event emitter
 * const emitter = new AsyncEventEmitter();
 *
 * // Define an async event listener
 * const listener = async (message: string) => {
 *   Logger.log('event start with param: ', message);
 *   await sleep(5000);
 * };
 *
 * // Listen for 'greet' event
 * emitter.on('TestEvent', listener);
 *
 * // Emit the 'greet' event and wait for it to be done
 * awaitForEventDone('TestEvent', 'Hello World!');
 *    // will be call after 5000ms delay
 *   .then(() => Logger.log('event done'));
 */
export class AsyncEventEmitter extends EventEmitter {
  private listenerMap = new WeakMap<
    (...args: any[]) => void,
    (...args: any[]) => void
  >();

  on(eventName: string | symbol, listener: (...args: any[]) => void): this {
    const wrappedListener = async (...args: any[]) => {
      const tx = makeID(5);

      try {
        if (app.isDeveloper && DEBUG_VARS.enableAsyncEventEmitterLogs) {
          logger.log(new Date(), 'event started', tx, eventName, ...args);
        }
        // check if event called from `awaitForEventDone` function
        if (args?.length) {
          const resolver = args[args.length - 1];
          if (
            typeof resolver === 'function' &&
            resolver.prototype.key === EventResolverSymbol
          ) {
            // event start
            try {
              await listener(...args);
            } catch (e) {}
            // event done'
            if (app.isDeveloper && DEBUG_VARS.enableAsyncEventEmitterLogs) {
              logger.log(new Date(), 'async event finished', tx, eventName);
            }
            return await resolver();
          }
        }
        await listener(...args);
        if (app.isDeveloper && DEBUG_VARS.enableAsyncEventEmitterLogs) {
          logger.log(new Date(), 'event finished', tx, eventName);
        }
      } catch (err) {
        logger.error(new Date(), 'ERROR', tx, eventName, err);
      }
    };
    this.listenerMap.set(listener, wrappedListener);
    return super.on(eventName, wrappedListener);
  }

  removeListener(
    eventName: string | symbol,
    listener: (...args: any[]) => void,
  ): this {
    const wrappedListener = this.listenerMap.get(listener);
    if (wrappedListener) {
      this.listenerMap.delete(listener);
      return super.removeListener(eventName, wrappedListener);
    }

    return this;
  }

  once(eventName: string | symbol, listener: (...args: any[]) => void): this {
    const wrappedListener = async (...args: any[]) => {
      const tx = makeID(5);

      try {
        if (app.isDeveloper && DEBUG_VARS.enableAsyncEventEmitterLogs) {
          logger.log(new Date(), 'event started', tx, eventName, ...args);
        }
        if (args?.length) {
          const resolver = args[args.length - 1];
          if (
            typeof resolver === 'function' &&
            resolver.prototype.key === EventResolverSymbol
          ) {
            try {
              await listener(...args);
            } catch (e) {}
            // event done'
            if (app.isDeveloper && DEBUG_VARS.enableAsyncEventEmitterLogs) {
              logger.log(new Date(), 'async event finished', tx, eventName);
            }
            // remove listeners after the event is done
            this.removeListener(eventName, listener);
            this.removeListener(eventName, wrappedListener);
            return await resolver();
          }
        }
        // remove listeners after the event is done
        this.removeListener(eventName, listener);
        this.removeListener(eventName, wrappedListener);
        await listener(...args);
        if (app.isDeveloper && DEBUG_VARS.enableAsyncEventEmitterLogs) {
          logger.log(new Date(), 'event finished', tx, eventName);
        }
      } catch (err) {
        logger.error(new Date(), 'ERROR', tx, eventName, err);
      }
    };
    this.listenerMap.set(listener, wrappedListener);
    return super.once(eventName, wrappedListener);
  }

  off = this.removeListener;
}
