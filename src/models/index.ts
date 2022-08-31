import Realm from 'realm';
import {utils} from 'ethers';
import {WalletSchema} from './wallet';
import {UserSchema} from './user';
import {TransactionSchema} from './transaction';
import {ContactSchema} from './contact';

export const realm = new Realm({
  schema: [WalletSchema, UserSchema, TransactionSchema, ContactSchema],
  schemaVersion: 7,
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

    if (oldRealm.schemaVersion < 6) {
      const oldObjects = oldRealm.objects('User');
      const newObjects = newRealm.objects('User');
      for (const objectIndex in oldObjects) {
        const newObject = newObjects[objectIndex];
        delete newObject.pin;
      }
    }

    if (oldRealm.schemaVersion < 7) {
      const oldObjects = oldRealm.objects('Wallet');
      const newObjects = newRealm.objects('Wallet');

      let hasMain = false;

      for (const objectIndex in oldObjects) {
        const newObject = newObjects[objectIndex];
        newObject.main = !hasMain;
        hasMain = true;
      }
    }
  },
});
