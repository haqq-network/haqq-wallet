import Realm from 'realm';

import {News} from '@app/models/news';
import {
  ContactRealmObject,
  TransactionRealmObject,
  WalletRealmObject,
} from '@app/models/realm-object-for-migration';
import {Refferal} from '@app/models/refferal';
import {UserSchema, UserType} from '@app/models/user';
import {VariablesBool} from '@app/models/variables-bool';
import {VariablesDate} from '@app/models/variables-date';
import {VariablesString} from '@app/models/variables-string';
import {VestingMetadata} from '@app/models/vesting-metadata';
import {Balance} from '@app/services/balance';
import {AppTheme, WalletType} from '@app/types';
import {
  CARD_DEFAULT_STYLE,
  ETH_HD_PATH,
  TEST_NETWORK_ID,
} from '@app/variables/common';

import {Provider} from './provider';
import {RssNews} from './rss-news';
import {WalletConnectSessionMetadata} from './wallet-connect-session-metadata';
import {Web3BrowserBookmark} from './web3-browser-bookmark';
import {Web3BrowserSearchHistory} from './web3-browser-search-history';
import {Web3BrowserSession} from './web3-browser-session';

const logger = Logger.create('realm', {stringifyJson: true});

export const realm = new Realm({
  schema: [
    Web3BrowserSession,
    Web3BrowserBookmark,
    Web3BrowserSearchHistory,
    WalletConnectSessionMetadata,
    WalletRealmObject,
    UserSchema,
    TransactionRealmObject,
    ContactRealmObject,
    Refferal,
    News,
    VariablesDate,
    VariablesBool,
    VariablesString,
    RssNews,
    VestingMetadata,
  ],
  schemaVersion: 73,
  onMigration: (oldRealm, newRealm) => {
    logger.log('onMigration', {
      oldRealmVersion: oldRealm.schemaVersion,
      newRealmVersion: newRealm.schemaVersion,
    });
    if (oldRealm.schemaVersion < 9) {
      logger.log('migration step #1');
      const oldObjects = oldRealm.objects('Wallet');
      const newObjects = newRealm.objects<{
        isHidden: boolean;
        cardStyle: string;
      }>('Wallet');

      logger.log({
        oldObjects: oldObjects.toJSON(),
        newObjects: newObjects.toJSON(),
      });

      for (const objectIndex in oldObjects) {
        const newObject = newObjects[objectIndex];
        newObject.isHidden = false;
        newObject.cardStyle = 'flat';
      }
    }

    if (oldRealm.schemaVersion < 10) {
      logger.log('migration step #2');
      const oldObjects = oldRealm.objects('User');
      const newObjects = newRealm.objects<{language: string}>('User');

      logger.log({
        oldObjects: oldObjects.toJSON(),
        newObjects: newObjects.toJSON(),
      });

      for (const objectIndex in oldObjects) {
        const newObject = newObjects[objectIndex];
        newObject.language = 'en';
      }
    }

    if (oldRealm.schemaVersion < 15) {
      logger.log('migration step #3');
      const oldObjects = oldRealm.objects('Wallet');
      const newObjects = newRealm.objects<{pattern: string}>('Wallet');

      logger.log({
        oldObjects: oldObjects.toJSON(),
        newObjects: newObjects.toJSON(),
      });

      for (const objectIndex in oldObjects) {
        const newObject = newObjects[objectIndex];
        newObject.pattern = CARD_DEFAULT_STYLE;
      }
    }

    if (oldRealm.schemaVersion < 17) {
      logger.log('migration step #4');
      const oldObjects = oldRealm.objects('User');
      const newObjects = newRealm.objects<{snoozeBackup: null}>('User');

      logger.log({
        oldObjects: oldObjects.toJSON(),
        newObjects: newObjects.toJSON(),
      });

      for (const objectIndex in oldObjects) {
        const newObject = newObjects[objectIndex];
        newObject.snoozeBackup = null;
      }
    }

    if (oldRealm.schemaVersion < 20) {
      logger.log('migration step #5');
      const oldObjects = oldRealm.objects('Wallet');
      const newObjects = newRealm.objects<{type: string}>('Wallet');

      logger.log({
        oldObjects: oldObjects.toJSON(),
        newObjects: newObjects.toJSON(),
      });

      for (const objectIndex in oldObjects) {
        const newObject = newObjects[objectIndex];
        newObject.type = WalletType.hot;
      }
    }

    if (oldRealm.schemaVersion < 22) {
      logger.log('migration step #6');
      const oldObjects = oldRealm.objects('User');
      const newObjects = newRealm.objects<{providerId: string}>('User');

      logger.log({
        oldObjects: oldObjects.toJSON(),
        newObjects: newObjects.toJSON(),
      });

      for (const objectIndex in oldObjects) {
        const newObject = newObjects[objectIndex];
        newObject.providerId = TEST_NETWORK_ID;
      }
    }

    if (oldRealm.schemaVersion < 23) {
      logger.log('migration step #7');
      const oldObjects = oldRealm.objects('Transaction');
      const newObjects = newRealm.objects<{providerId: string}>('Transaction');

      logger.log({
        oldObjects: oldObjects.toJSON(),
        newObjects: newObjects.toJSON(),
      });

      for (const objectIndex in oldObjects) {
        const newObject = newObjects[objectIndex];
        newObject.providerId = TEST_NETWORK_ID;
      }
    }

    if (oldRealm.schemaVersion < 24) {
      logger.log('migration step #8');
      const oldObjects = oldRealm.objects('User');
      const newObjects = newRealm.objects<{onboarded: boolean}>('User');

      logger.log({
        oldObjects: oldObjects.toJSON(),
        newObjects: newObjects.toJSON(),
      });

      for (const objectIndex in oldObjects) {
        const newObject = newObjects[objectIndex];
        newObject.onboarded = true;
      }
    }

    if (oldRealm.schemaVersion < 25) {
      logger.log('migration step #9');
      const oldObjects = oldRealm.objects('User');
      const newObjects = newRealm.objects<{theme: string}>('User');

      logger.log({
        oldObjects: oldObjects.toJSON(),
        newObjects: newObjects.toJSON(),
      });

      for (const objectIndex in oldObjects) {
        const newObject = newObjects[objectIndex];
        newObject.theme = AppTheme.light;
      }
    }

    if (oldRealm.schemaVersion < 26) {
      logger.log('migration step #10');
      const oldObjects = oldRealm.objects('Wallet');
      const newObjects = newRealm.objects<{isMain: boolean}>('Wallet');

      logger.log({
        oldObjects: oldObjects.toJSON(),
        newObjects: newObjects.toJSON(),
      });

      for (const objectIndex in oldObjects) {
        const newObject = newObjects[objectIndex];
        newObject.isMain = false;
      }
    }

    if (oldRealm.schemaVersion < 33) {
      logger.log('migration step #13');
      const oldObjects = oldRealm.objects<{
        address: string;
        rootAddress?: string;
      }>('Wallet');
      const newObjects = newRealm.objects<{
        address: string;
        rootAddress?: string;
      }>('Wallet');

      logger.log({
        oldObjects: oldObjects.toJSON(),
        newObjects: newObjects.toJSON(),
      });

      for (const objectIndex in oldObjects) {
        const newObject = newObjects[objectIndex];
        newObject.address = newObject.address.toLowerCase();

        if (newObject.rootAddress) {
          newObject.rootAddress = newObject.rootAddress.toLowerCase();
        }
      }
    }

    if (oldRealm.schemaVersion < 34) {
      logger.log('migration step #14');
      const oldObjects = oldRealm.objects<{
        cardStyle: string;
      }>('Wallet');
      const newObjects = newRealm.objects<{
        cardStyle: string;
      }>('Wallet');

      logger.log({
        oldObjects: oldObjects.toJSON(),
        newObjects: newObjects.toJSON(),
      });

      for (const objectIndex in oldObjects) {
        const newObject = newObjects[objectIndex];
        newObject.cardStyle =
          oldObjects[objectIndex].cardStyle === 'flat' ? 'flat' : 'gradient';
      }
    }

    if (oldRealm.schemaVersion < 35) {
      logger.log('migration step #15');
      const oldObjects = oldRealm.objects<{
        path: string;
      }>('Wallet');
      const newObjects = newRealm.objects<{
        path: string;
        type: string;
      }>('Wallet');

      logger.log({
        oldObjects: oldObjects.toJSON(),
        newObjects: newObjects.toJSON(),
      });

      for (const objectIndex in oldObjects) {
        const newObject = newObjects[objectIndex];

        if (newObject.type === WalletType.ledgerBt) {
          newObject.path = ETH_HD_PATH;
        }
      }
    }

    if (oldRealm.schemaVersion < 36) {
      logger.log('migration step #16');
      const oldObjects = oldRealm.objects<{
        mnemonicSaved: boolean;
      }>('Wallet');
      const newObjects = newRealm.objects<{
        mnemonicSaved: boolean;
        type: string;
      }>('Wallet');

      logger.log({
        oldObjects: oldObjects.toJSON(),
        newObjects: newObjects.toJSON(),
      });

      for (const objectIndex in oldObjects) {
        const newObject = newObjects[objectIndex];

        if (
          newObject.type === WalletType.ledgerBt ||
          newObject.type === WalletType.hot
        ) {
          newObject.mnemonicSaved = true;
        }
      }
    }

    if (oldRealm.schemaVersion < 37) {
      logger.log('migration step #17');
      const oldObjects = oldRealm.objects('Wallet');
      const newObjects = newRealm.objects<{
        deviceId: string;
        accountId: string;
        version: number;
        type: string;
      }>('Wallet');

      logger.log({
        oldObjects: oldObjects.toJSON(),
        newObjects: newObjects.toJSON(),
      });

      for (const objectIndex in oldObjects) {
        const newObject = newObjects[objectIndex];

        switch (newObject.type) {
          case WalletType.ledgerBt:
            newObject.accountId = newObject.deviceId;
            newObject.version = 2;
            break;
          default:
            newObject.version = 1;
            break;
        }
      }
    }

    if (oldRealm.schemaVersion < 43) {
      logger.log('migration step #18');
      const oldObjects = oldRealm.objects<{
        hash: string;
        account: string;
        from: string;
        to: string | null;
      }>('Transaction');
      const newObjects = newRealm.objects<{
        hash: string;
        account: string;
        from: string;
        to: string | null;
      }>('Transaction');

      logger.log({
        oldObjects: oldObjects.toJSON(),
        newObjects: newObjects.toJSON(),
      });

      for (const objectIndex in oldObjects) {
        const oldObject = oldObjects[objectIndex];
        const newObject = newObjects[objectIndex];

        newObject.hash = oldObject.hash.toLowerCase();
        newObject.account = oldObject.account.toLowerCase();
        newObject.from = oldObject.from.toLowerCase();

        if (oldObject.to !== null) {
          newObject.to = oldObject.to.toLowerCase();
        }
      }
    }

    if (oldRealm.schemaVersion < 50) {
      logger.log('migration step #19');
      const oldObjects = oldRealm.objects<{
        providerId: string;
      }>('Transaction');

      const newObjects = newRealm.objects<{
        chainId: string;
      }>('Transaction');

      const chainIds = new Map();

      const providers = Provider.getAll();

      logger.log({
        providers,
        oldObjects: oldObjects.toJSON(),
        newObjects: newObjects.toJSON(),
      });

      for (const provider of providers) {
        chainIds.set(provider.id, String(provider.ethChainId));
      }

      for (const objectIndex in oldObjects) {
        const newObject = newObjects[objectIndex];
        newObject.chainId = chainIds.get(oldObjects[objectIndex].providerId);
      }
    }

    if (oldRealm.schemaVersion < 60) {
      logger.log('migration step #20');
      const users = oldRealm.objects<UserType>('User');
      if (users.length) {
        const user = users[0];
        logger.log('user', user.toJSON());

        newRealm.create('VariablesBool', {
          id: 'isDeveloper',
          value: !!user.isDeveloper,
        });

        newRealm.create('VariablesBool', {
          id: 'biometry',
          value: !!user.biometry,
        });

        newRealm.create('VariablesBool', {
          id: 'bluetooth',
          value: !!user.bluetooth,
        });

        newRealm.create('VariablesBool', {
          id: 'onboarded',
          value: !!user.onboarded,
        });

        newRealm.create('VariablesString', {
          id: 'language',
          value: user.language,
        });

        newRealm.create('VariablesString', {
          id: 'theme',
          value: user.theme,
        });

        newRealm.create('VariablesString', {
          id: 'providerId',
          value: user.providerId,
        });
      }
    }

    if (oldRealm.schemaVersion < 68) {
      logger.log('migration step #22');
      const oldObjects = oldRealm.objects<{fee: number}>('Transaction');
      const newObjects = newRealm.objects<{feeHex: string}>('Transaction');

      logger.log({
        oldObjects: oldObjects.toJSON(),
        newObjects: newObjects.toJSON(),
      });

      for (const objectIndex in oldObjects) {
        const newObject = newObjects[objectIndex];
        const oldObject = oldObjects[objectIndex];
        newObject.feeHex = new Balance(oldObject.fee).toHex();
      }
    }
    if (oldRealm.schemaVersion < 69) {
      logger.log('migration step #22');
      const oldObjects = oldRealm.objects('Transaction');
      const newObjects = newRealm.objects<{input: string}>('Transaction');

      logger.log({
        oldObjects: oldObjects.toJSON(),
        newObjects: newObjects.toJSON(),
      });

      for (const objectIndex in oldObjects) {
        const newObject = newObjects[objectIndex];
        newObject.input = '0x';
      }
    }
    if (oldRealm.schemaVersion < 72) {
      logger.log('migration step #23');
      const oldObjects = oldRealm.objects('Web3BrowserBookmark');
      const newObjects = newRealm.objects<{eventName: string}>(
        'Web3BrowserBookmark',
      );

      logger.log({
        oldObjects: oldObjects.toJSON(),
        newObjects: newObjects.toJSON(),
      });

      for (const objectIndex in oldObjects) {
        const newObject = newObjects[objectIndex];
        newObject.eventName = '';
      }
    }
    logger.log('realm migration finished');
  },
});
