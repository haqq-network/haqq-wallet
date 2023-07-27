import {app} from '@app/contexts/app';
import {Events} from '@app/events';

export const EventResolverSymbol = Symbol.for('EventResolver');

export async function awaitForEventDone(
  event: Events,
  ...params: any[]
): Promise<void> {
  return new Promise(async resolve => {
    resolve.prototype.key = EventResolverSymbol;
    app.emit(event, ...params, resolve);
  });
}
