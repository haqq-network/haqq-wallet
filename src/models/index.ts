import Realm from 'realm';
import {WalletSchema} from './wallet';
import {UserSchema} from './user';
import {Transaction} from './transaction';
import {utils} from 'ethers';

export const realm = new Realm({
  schema: [WalletSchema, UserSchema, Transaction],
  schemaVersion: 6,
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

    if (oldRealm.schemaVersion < 4) {
      const oldObjects = oldRealm.objects('Transaction');
      const newObjects = newRealm.objects('Transaction');
      for (const objectIndex in oldObjects) {
        const data = JSON.parse(oldObjects[objectIndex].raw);
        const newObject = newObjects[objectIndex];
        newObject.from = data.from;
        newObject.to = data.to;
        newObject.value = Number(utils.formatEther(data.value));
        newObject.fee = 0;
        newObject.confirmed = false;
      }
    }

    if (oldRealm.schemaVersion < 5) {
      const oldObjects = oldRealm.objects('Wallet');
      const newObjects = newRealm.objects('Wallet');
      for (const objectIndex in oldObjects) {
        const newObject = newObjects[objectIndex];
        newObject.mnemonic_saved = true;
      }
    }

    if (oldRealm.schemaVersion < 5) {
      const oldObjects = oldRealm.objects('User');
      const newObjects = newRealm.objects('User');
      for (const objectIndex in oldObjects) {
        const newObject = newObjects[objectIndex];
        delete newObject.pin;
      }
    }
  },
});
