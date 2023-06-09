import {app} from '@app/contexts/app';
import {Events} from '@app/events';

export async function awaitForEventDone(
  event: Events,
  ...params: any[]
): Promise<void> {
  return new Promise(async resolve => {
    app.emit(event, ...params, resolve);
  });
}
