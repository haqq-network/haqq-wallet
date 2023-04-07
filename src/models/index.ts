import Realm from 'realm';

import {Contact} from '@app/models/contact';
import {GovernanceVoting} from '@app/models/governance-voting';
import {Provider} from '@app/models/provider';
import {Refferal} from '@app/models/refferal';
import {StakingMetadata} from '@app/models/staking-metadata';
import {Transaction} from '@app/models/transaction';
import {UserSchema} from '@app/models/user';
import {Wallet} from '@app/models/wallet';
import {WalletConnectSessionMetadata} from '@app/models/wallet-connect-session-metadata';
import {Web3BrowserSession} from '@app/models/web3-browser-session';
import {AppTheme, WalletType} from '@app/types';
import {
  CARD_DEFAULT_STYLE,
  ETH_HD_PATH,
  TEST_NETWORK,
} from '@app/variables/common';

export const realm = new Realm({
  schema: [
    Web3BrowserSession,
    WalletConnectSessionMetadata,
    Wallet,
    UserSchema,
    Transaction,
    Contact,
    Provider,
    StakingMetadata,
    GovernanceVoting,
    Refferal,
  ],
  schemaVersion: 41,
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
  },
});
