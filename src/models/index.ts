import Realm from 'realm';

import {AddressBook} from '@app/models/address-book';
import {Banner, BannerButton} from '@app/models/banner';
import {Contact} from '@app/models/contact';
import {News} from '@app/models/news';
import {NftCollection} from '@app/models/nft-collection';
import {Provider} from '@app/models/provider';
import {Refferal} from '@app/models/refferal';
import {StakingMetadata} from '@app/models/staking-metadata';
import {Transaction} from '@app/models/transaction';
import {UserSchema, UserType} from '@app/models/user';
import {VariablesBool} from '@app/models/variables-bool';
import {VariablesDate} from '@app/models/variables-date';
import {VariablesString} from '@app/models/variables-string';
import {Wallet} from '@app/models/wallet';
import {AppTheme, WalletType} from '@app/types';
import {
  CARD_DEFAULT_STYLE,
  ETH_HD_PATH,
  TEST_NETWORK,
} from '@app/variables/common';

import {WalletConnectSessionMetadata} from './wallet-connect-session-metadata';
import {Web3BrowserBookmark} from './web3-browser-bookmark';
import {Web3BrowserSearchHistory} from './web3-browser-search-history';
import {Web3BrowserSession} from './web3-browser-session';

export const realm = new Realm({
  schema: [
    Web3BrowserSession,
    Web3BrowserBookmark,
    Web3BrowserSearchHistory,
    WalletConnectSessionMetadata,
    Wallet,
    UserSchema,
    Transaction,
    Contact,
    Provider,
    StakingMetadata,
    Refferal,
    Banner,
    BannerButton,
    NftCollection,
    AddressBook,
    News,
    VariablesDate,
    VariablesBool,
    VariablesString,
  ],
  schemaVersion: 60,
  onMigration: (oldRealm, newRealm) => {
    if (oldRealm.schemaVersion < 9) {
      const oldObjects = oldRealm.objects('Wallet');
      const newObjects = newRealm.objects<{
        isHidden: boolean;
        cardStyle: string;
      }>('Wallet');

      for (const objectIndex in oldObjects) {
        const newObject = newObjects[objectIndex];
        newObject.isHidden = false;
        newObject.cardStyle = 'flat';
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

    if (oldRealm.schemaVersion < 25) {
      const oldObjects = oldRealm.objects('User');
      const newObjects = newRealm.objects<{theme: string}>('User');

      for (const objectIndex in oldObjects) {
        const newObject = newObjects[objectIndex];
        newObject.theme = AppTheme.light;
      }
    }

    if (oldRealm.schemaVersion < 26) {
      const oldObjects = oldRealm.objects('Wallet');
      const newObjects = newRealm.objects<{isMain: boolean}>('Wallet');

      for (const objectIndex in oldObjects) {
        const newObject = newObjects[objectIndex];
        newObject.isMain = false;
      }
    }

    if (oldRealm.schemaVersion < 27) {
      const providersList = require('@assets/migrations/providers.json');

      const oldObjects = oldRealm.objects<{id: string}>('Provider');
      const newObjects = newRealm.objects<{
        ethChainId: string;
        ethRpcEndpoint: string;
        cosmosChainId: string;
        cosmosRestEndpoint: string;
        tmRpcEndpoint: string;
      }>('Provider');

      for (const objectIndex in oldObjects) {
        const provider = providersList.find(
          (p: {id: string}) => p.id === oldObjects[objectIndex].id,
        );

        if (provider) {
          const newObject = newObjects[objectIndex];
          newObject.ethChainId = provider.ethChainId;
          newObject.ethRpcEndpoint = provider.ethRpcEndpoint;
          newObject.cosmosChainId = provider.cosmosChainId;
          newObject.cosmosRestEndpoint = provider.cosmosRestEndpoint;
          newObject.tmRpcEndpoint = provider.tmRpcEndpoint;
        }
      }
    }

    if (oldRealm.schemaVersion < 30) {
      const oldObjects = oldRealm.objects<{id: string}>('Provider');
      const newObjects = newRealm.objects<{
        isEditable: boolean;
      }>('Provider');

      for (const objectIndex in oldObjects) {
        const newObject = newObjects[objectIndex];
        newObject.isEditable = false;
      }
    }

    if (oldRealm.schemaVersion < 33) {
      const oldObjects = oldRealm.objects<{
        address: string;
        rootAddress?: string;
      }>('Wallet');
      const newObjects = newRealm.objects<{
        address: string;
        rootAddress?: string;
      }>('Wallet');

      for (const objectIndex in oldObjects) {
        const newObject = newObjects[objectIndex];
        newObject.address = newObject.address.toLowerCase();

        if (newObject.rootAddress) {
          newObject.rootAddress = newObject.rootAddress.toLowerCase();
        }
      }
    }

    if (oldRealm.schemaVersion < 34) {
      const oldObjects = oldRealm.objects<{
        cardStyle: string;
      }>('Wallet');
      const newObjects = newRealm.objects<{
        cardStyle: string;
      }>('Wallet');

      for (const objectIndex in oldObjects) {
        const newObject = newObjects[objectIndex];
        newObject.cardStyle =
          oldObjects[objectIndex].cardStyle === 'flat' ? 'flat' : 'gradient';
      }
    }

    if (oldRealm.schemaVersion < 35) {
      const oldObjects = oldRealm.objects<{
        path: string;
      }>('Wallet');
      const newObjects = newRealm.objects<{
        path: string;
        type: string;
      }>('Wallet');

      for (const objectIndex in oldObjects) {
        const newObject = newObjects[objectIndex];

        if (newObject.type === WalletType.ledgerBt) {
          newObject.path = ETH_HD_PATH;
        }
      }
    }

    if (oldRealm.schemaVersion < 36) {
      const oldObjects = oldRealm.objects<{
        mnemonicSaved: boolean;
      }>('Wallet');
      const newObjects = newRealm.objects<{
        mnemonicSaved: boolean;
        type: string;
      }>('Wallet');

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
      const oldObjects = oldRealm.objects('Wallet');
      const newObjects = newRealm.objects<{
        deviceId: string;
        accountId: string;
        version: number;
        type: string;
      }>('Wallet');

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
      const oldObjects = oldRealm.objects<{
        providerId: string;
      }>('Transaction');

      const newObjects = newRealm.objects<{
        chainId: string;
      }>('Transaction');

      const chainIds = new Map();

      const providers = oldRealm.objects<{
        id: string;
        ethChainId: number;
      }>('Provider');

      for (const provider of providers) {
        chainIds.set(provider.id, String(provider.ethChainId));
      }

      for (const objectIndex in oldObjects) {
        const newObject = newObjects[objectIndex];
        newObject.chainId = chainIds.get(oldObjects[objectIndex].providerId);
      }
    }

    if (oldRealm.schemaVersion < 60) {
      const users = oldRealm.objects<UserType>('User');

      if (users.length) {
        const user = users[0];

        newRealm.create('VariablesBool', {
          id: 'isDeveloper',
          value: user.isDeveloper,
        });

        newRealm.create('VariablesBool', {
          id: 'biometry',
          value: user.biometry,
        });

        newRealm.create('VariablesBool', {
          id: 'bluetooth',
          value: user.bluetooth,
        });

        newRealm.create('VariablesBool', {
          id: 'onboarded',
          value: user.onboarded,
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
  },
});
