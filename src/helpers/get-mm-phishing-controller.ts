import {PhishingController} from '@metamask/phishing-controller';

export const getMMPhishingController = () => {
  return new PhishingController({
    //@ts-ignore\
    messenger: {
      registerActionHandler: () => {},
      unregisterActionHandler: () => {},
      call: () => ({}) as any,
      registerInitialEventPayload: () => {},
      publish: () => {},
      subscribe: function <EventType extends never>(
        _eventType: EventType,
        _handler: never,
      ): void {
        throw new Error('Function not implemented.');
      },
      unsubscribe: function <EventType extends never>(
        _event: EventType,
        _handler: never,
      ): void {
        throw new Error('Function not implemented.');
      },
      clearEventSubscriptions: function <EventType extends never>(
        _event: EventType,
      ): void {
        throw new Error('Function not implemented.');
      },
      //@ts-ignore
      '#private': undefined,
    },
  });
};
