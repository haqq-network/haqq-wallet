import Realm from 'realm';
import {utils} from 'ethers';
import {WalletRealm} from './wallet';
import {UserSchema} from './user';
import {Transaction} from './transaction';
import {Contact} from './contact';
import {CARD_COLORS, CARD_DEFAULT_STYLE, CARD_PATTERN} from '../variables';
import {WalletType} from '../types';

export const realm = new Realm({
  schema: [WalletRealm, UserSchema, Transaction, Contact],
  schemaVersion: 20,
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

    if (oldRealm.schemaVersion < 9) {
      const oldObjects = oldRealm.objects('Wallet');
      const newObjects = newRealm.objects('Wallet');

      for (const objectIndex in oldObjects) {
        const newObject = newObjects[objectIndex];
        newObject.isHidden = false;
        newObject.cardStyle = 'defaultGreen';
      }
    }

    if (oldRealm.schemaVersion < 10) {
      const oldObjects = oldRealm.objects('User');
      const newObjects = newRealm.objects('User');

      for (const objectIndex in oldObjects) {
        const newObject = newObjects[objectIndex];
        newObject.language = 'en';
      }
    }

    if (oldRealm.schemaVersion < 11) {
      const oldObjects = oldRealm.objects('Wallet');
      const newObjects = newRealm.objects('Wallet');

      for (const objectIndex in oldObjects) {
        const newObject = newObjects[objectIndex];
        const existsData = JSON.parse(oldObjects[objectIndex].data);
        newObject.data = JSON.stringify({
          ...existsData,
          method: 'js',
        });
      }
    }

    if (oldRealm.schemaVersion < 12) {
      const oldObjects = oldRealm.objects('Wallet');
      const newObjects = newRealm.objects('Wallet');

      for (const objectIndex in oldObjects) {
        const newObject = newObjects[objectIndex];

        newObject.colorFrom = CARD_COLORS[oldObjects[objectIndex].cardStyle][0];
        newObject.colorTo = CARD_COLORS[oldObjects[objectIndex].cardStyle][1];
        newObject.colorPattern =
          CARD_PATTERN[oldObjects[objectIndex].cardStyle];
        newObject.pattern = 'card-pattern-0';

        switch (oldObjects[objectIndex].cardStyle) {
          case 'defaultGreen':
          case 'defaultBlack':
            newObject.cardStyle = 'flat';
            break;
          default:
            newObject.cardStyle = 'gradient';
        }
      }
    }

    if (oldRealm.schemaVersion < 14) {
      const oldObjects = oldRealm.objects<{mnemonic_saved: boolean}>('Wallet');
      const newObjects = newRealm.objects<{mnemonicSaved: boolean}>('Wallet');

      for (const objectIndex in oldObjects) {
        const newObject = newObjects[objectIndex];
        newObject.mnemonicSaved = oldObjects[objectIndex].mnemonic_saved;
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
      const newObjects = newRealm.objects('User');

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
  },
});
