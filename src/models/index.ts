import Realm from 'realm';
import {Wallet} from './wallet';
import {User} from './user';

export const realm = new Realm({
  schema: [Wallet, User],
  schemaVersion: 2,
  migration: (oldRealm, newRealm) => {
    if (oldRealm.schemaVersion < 2) {
      const oldObjects = oldRealm.objects('User');
      const newObjects = newRealm.objects('User');
      for (const objectIndex in oldObjects) {
        const oldObject = oldObjects[objectIndex];
        const newObject = newObjects[objectIndex];
        newObject.biometry = oldObject.touchId;
      }
    }
  },
});
