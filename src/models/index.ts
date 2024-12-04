import Realm from 'realm';

import {News} from '@app/models/news';
import {Refferal} from '@app/models/refferal';
import {UserSchema, UserType} from '@app/models/user';
import {VariablesBool} from '@app/models/variables-bool';
import {VariablesDate} from '@app/models/variables-date';
import {VariablesString} from '@app/models/variables-string';
import {VestingMetadata} from '@app/models/vesting-metadata';
import {AppTheme} from '@app/types';
import {TEST_NETWORK_ID} from '@app/variables/common';

import {AppStore} from './app';
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
    UserSchema,
    Refferal,
    News,
    VariablesDate,
    VariablesBool,
    VariablesString,
    RssNews,
    VestingMetadata,
  ],
  schemaVersion: 75,
  onMigration: (oldRealm, newRealm) => {
    logger.log('onMigration', {
      oldRealmVersion: oldRealm.schemaVersion,
      newRealmVersion: newRealm.schemaVersion,
    });
    if (oldRealm.schemaVersion < 17) {
      logger.log('migration step #1');
      const oldObjects = oldRealm.objects('User');
      const newObjects = newRealm.objects<{snoozeBackup: null}>('User');

      for (const objectIndex in oldObjects) {
        const newObject = newObjects[objectIndex];
        newObject.snoozeBackup = null;
      }

      logger.log({
        oldObjects: oldObjects.toJSON(),
        newObjects: newObjects.toJSON(),
      });
    }

    if (oldRealm.schemaVersion < 22) {
      logger.log('migration step #2');
      const oldObjects = oldRealm.objects('User');
      const newObjects = newRealm.objects<{providerId: string}>('User');

      for (const objectIndex in oldObjects) {
        const newObject = newObjects[objectIndex];
        newObject.providerId = TEST_NETWORK_ID;
      }

      logger.log({
        oldObjects: oldObjects.toJSON(),
        newObjects: newObjects.toJSON(),
      });
    }

    if (oldRealm.schemaVersion < 25) {
      logger.log('migration step #3');
      const oldObjects = oldRealm.objects('User');
      const newObjects = newRealm.objects<{theme: string}>('User');

      for (const objectIndex in oldObjects) {
        const newObject = newObjects[objectIndex];
        newObject.theme = AppTheme.light;
      }

      logger.log({
        oldObjects: oldObjects.toJSON(),
        newObjects: newObjects.toJSON(),
      });
    }

    if (oldRealm.schemaVersion < 60) {
      logger.log('migration step #4');
      const users = oldRealm.objects<UserType>('User');
      if (users.length) {
        const user = users[0];
        logger.log('user', user.toJSON());

        newRealm.create('VariablesBool', {
          id: 'biometry',
          value: !!user.biometry,
        });

        newRealm.create('VariablesBool', {
          id: 'bluetooth',
          value: !!user.bluetooth,
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

    if (oldRealm.schemaVersion < 72) {
      logger.log('migration step #5');
      const oldObjects = oldRealm.objects('Web3BrowserBookmark');
      const newObjects = newRealm.objects<{eventName: string}>(
        'Web3BrowserBookmark',
      );

      for (const objectIndex in oldObjects) {
        const newObject = newObjects[objectIndex];
        newObject.eventName = '';
      }

      logger.log({
        oldObjects: oldObjects.toJSON(),
        newObjects: newObjects.toJSON(),
      });
    }

    if (oldRealm.schemaVersion < 74) {
      logger.log('migration step #6');
      const oldVariablesBoolObjects = oldRealm.objects('VariablesBool');
      const newVariablesBoolObjects = newRealm.objects<{
        id: string;
        value: boolean;
      }>('VariablesBool');

      const oldUserObjects = oldRealm.objects('User');
      const newUserObjects = newRealm.objects<{onboarded?: boolean}>('User');

      let onboardedObject = -1;
      for (const objectIndex in oldVariablesBoolObjects) {
        const newObject = newVariablesBoolObjects[objectIndex];

        if (newObject.id === 'onboarded') {
          AppStore.isOnboarded = newObject.value;
          onboardedObject = objectIndex as never as number;
        }
      }

      if (onboardedObject !== -1) {
        newVariablesBoolObjects.slice(onboardedObject, onboardedObject + 1);
      }

      for (const objectIndex in oldUserObjects) {
        const newObject = newUserObjects[objectIndex];
        delete newObject.onboarded;
      }

      logger.log({
        oldVariablesBoolObjects: oldVariablesBoolObjects.toJSON(),
        newVariablesBoolObjects: newVariablesBoolObjects.toJSON(),
      });

      logger.log({
        oldUserObjects: oldUserObjects.toJSON(),
        newUserObjects: newUserObjects.toJSON(),
      });
    }

    if (oldRealm.schemaVersion < 75) {
      logger.log('migration step #7');
      const oldObjects = oldRealm.objects('VariablesBool');
      const newObjects = newRealm.objects<{
        id: string;
        value: boolean;
      }>('VariablesBool');

      for (const objectIndex in oldObjects) {
        const newObject = newObjects[objectIndex];

        if (newObject.id === 'isDeveloper' || newObject.id === 'isTesterMode') {
          //@ts-ignore
          delete newObject[objectIndex];
        }
      }

      logger.log({
        oldObjects: oldObjects.toJSON(),
        newObjects: newObjects.toJSON(),
      });
    }
    logger.log('realm migration finished');
  },
});
