declare module 'events' {
  export type OptionalArgs<Args> = Args | [];
  export type BaseEventArgsArr = any[];
  export type BaseEventName = string | symbol | number;
  export type BaseEvent = Record<BaseEventName, BaseEventArgsArr>;

  export class EventEmitter<Events extends BaseEvent> {
    addListener<EventName extends keyof Events>(
      eventName?: EventName,
      listener?: (...args: Events[EventName]) => void,
    ): this;
    on<EventName extends keyof Events>(
      eventName?: EventName,
      listener?: (...args: Events[EventName]) => void,
    ): this;
    once<EventName extends keyof Events>(
      eventName?: EventName,
      listener?: (...args: Events[EventName]) => void,
    ): this;
    removeListener<EventName extends keyof Events>(
      eventName?: EventName,
      listener?: (...args: Events[EventName]) => void,
    ): this;
    off<EventName extends keyof Events>(
      eventName?: EventName,
      listener?: (...args: Events[EventName]) => void,
    ): this;
    removeAllListeners(event?: string | symbol): this;
    setMaxListeners(n: number): this;
    getMaxListeners(): number;
    listeners<EventName extends keyof Events>(
      eventName?: EventName,
    ): Function[];
    rawListeners<EventName extends keyof Events>(
      eventName?: EventName,
    ): Function[];
    emit<EventName extends keyof Events>(
      eventName?: EventName,
      ...args: Events[EventName]
    ): boolean;
    listenerCount<EventName extends keyof Events>(
      eventName?: EventName,
    ): number;
    prependOnceListener<EventName extends keyof Events>(
      eventName?: EventName,
      listener?: (...args: Events[EventName]) => void,
    ): this;
    eventNames(): Array<string | symbol>;
  }
}
