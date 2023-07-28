import EventEmitter from 'events';

import {EventResolverSymbol} from './await-for-event-done';

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
 *   console.log('event start with param: ', message);
 *   await sleep(5000);
 * };
 *
 * // Listen for 'greet' event
 * emitter.on('TestEvent', listener);
 *
 * // Emit the 'greet' event and wait for it to be done
 * awaitForEventDone('TestEvent', 'Hello World!');
 *    // will be call after 5000ms delay
 *   .then(() => console.log('event done'));
 */
export class AsyncEventEmitter extends EventEmitter {
  private listenerMap = new WeakMap<
    (...args: any[]) => void,
    (...args: any[]) => void
  >();

  on(eventName: string | symbol, listener: (...args: any[]) => void): this {
    const wrappedListener = async (...args: any[]) => {
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
          return await resolver();
        }
      }
      return await listener(...args);
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
      if (args?.length) {
        const resolver = args[args.length - 1];
        if (
          typeof resolver === 'function' &&
          resolver.prototype.key === EventResolverSymbol
        ) {
          try {
            await listener(...args);
          } catch (e) {}
          // remove listeners after the event is done
          this.removeListener(eventName, listener);
          this.removeListener(eventName, wrappedListener);
          return await resolver();
        }
      }
      // remove listeners after the event is done
      this.removeListener(eventName, listener);
      this.removeListener(eventName, wrappedListener);
      return await listener(...args);
    };
    this.listenerMap.set(listener, wrappedListener);
    return super.once(eventName, wrappedListener);
  }

  off = this.removeListener;
}
