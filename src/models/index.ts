import Realm from 'realm';
import {WalletRealm} from './wallet';
import {UserSchema} from './user';
import {Transaction} from './transaction';
import {Contact} from './contact';
import {CARD_DEFAULT_STYLE, TEST_NETWORK} from '../variables';
import {WalletType} from '../types';
import {Provider} from './provider';

export const realm = new Realm({
  schema: [WalletRealm, UserSchema, Transaction, Contact, Provider],
  schemaVersion: 24,
  migration: (oldRealm, newRealm) => {
    if (oldRealm.schemaVersion < 9) {
      const oldObjects = oldRealm.objects('Wallet');
      const newObjects = newRealm.objects<{
        isHidden: boolean;
        cardStyle: string;
      }>('Wallet');

      for (const objectIndex in oldObjects) {
        const newObject = newObjects[objectIndex];
        newObject.isHidden = false;
        newObject.cardStyle = 'defaultGreen';
      }
    }

    if (oldRealm.schemaVersion < 10) {
      const oldObjects = oldRealm.objects('User');
      const newObjects = newRealm.objects<{language: string}>('User');

      for (const objectIndex in oldObjects) {
        const newObject = newObjects[objectIndex];
        newObject.language = 'en';
      }
    }

    if (oldRealm.schemaVersion < 15) {
      const oldObjects = oldRealm.objects('Wallet');
      const newObjects = newRealm.objects<{pattern: string}>('Wallet');

      for (const objectIndex in oldObjects) {
        const newObject = newObjects[objectIndex];
        newObject.pattern = CARD_DEFAULT_STYLE;
      }
    }

    if (oldRealm.schemaVersion < 17) {
      const oldObjects = oldRealm.objects('User');
      const newObjects = newRealm.objects<{snoozeBackup: null}>('User');

      for (const objectIndex in oldObjects) {
        const newObject = newObjects[objectIndex];
        newObject.snoozeBackup = null;
      }
    }

    if (oldRealm.schemaVersion < 20) {
      const oldObjects = oldRealm.objects('Wallet');
      const newObjects = newRealm.objects<{type: string}>('Wallet');

      for (const objectIndex in oldObjects) {
        const newObject = newObjects[objectIndex];
        newObject.type = WalletType.hot;
      }
    }

    if (oldRealm.schemaVersion < 22) {
      const oldObjects = oldRealm.objects('User');
      const newObjects = newRealm.objects<{providerId: string}>('User');

      for (const objectIndex in oldObjects) {
        const newObject = newObjects[objectIndex];
        newObject.providerId = TEST_NETWORK;
      }
    }

    if (oldRealm.schemaVersion < 23) {
      const oldObjects = oldRealm.objects('Transaction');
      const newObjects = newRealm.objects<{providerId: string}>('Transaction');

      for (const objectIndex in oldObjects) {
        const newObject = newObjects[objectIndex];
        newObject.providerId = TEST_NETWORK;
      }
    }

    if (oldRealm.schemaVersion < 24) {
      const oldObjects = oldRealm.objects('User');
      const newObjects = newRealm.objects<{onboarded: boolean}>('User');

      for (const objectIndex in oldObjects) {
        const newObject = newObjects[objectIndex];
        newObject.onboarded = true;
      }
    }
  },
});
