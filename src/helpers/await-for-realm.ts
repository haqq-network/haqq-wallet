import {realm} from '@app/models';
import {sleep} from '@app/utils';

export async function awaitForRealm(): Promise<void> {
  return new Promise((resolve, reject) => {
    requestAnimationFrame(async () => {
      try {
        while (realm.isInTransaction) {
          await sleep(100);
        }
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  });
}
