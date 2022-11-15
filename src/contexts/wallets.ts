import {createContext} from 'react';

import {EventEmitter} from 'events';

import {isAfter} from 'date-fns';
import {Image} from 'react-native';

import {app} from '@app/contexts';
import {captureException} from '@app/helpers';
import {realm} from '@app/models';
import {Wallet, WalletRealm} from '@app/models/wallet';
import {
  restoreFromMnemonic,
  restoreFromPrivateKey,
} from '@app/services/eth-utils';
import {AddWalletParams, WalletType} from '@app/types';
import {getPatternName, sleep} from '@app/utils';

class Wallets extends EventEmitter {
  private _wallets: Map<string, Wallet>;
  private _initialized: boolean = false;

  constructor() {
    super();
    this._wallets = new Map();
    const wallets = realm.objects<WalletRealm>(WalletRealm.schema.name);

    wallets.addListener(() => {
      this.emit('wallets');
    });

    for (const rawWallet of wallets) {
      try {
        this.attachWallet(new Wallet(rawWallet));
      } catch (e) {
        if (e instanceof Error) {
          console.log(rawWallet, e.message);
        }
      }
    }
  }

  async init(snoozeBackup: Date): Promise<void> {
    if (this._initialized) {
      return;
    }

    this._initialized = true;

    Promise.all(
      Array.from(this._wallets.values()).map(w =>
        Image.prefetch(getPatternName(w.pattern)),
      ),
    ).then(() => {
      console.log('image prefetched');
    });

    await this.checkForBackup(snoozeBackup);
  }

  async checkForBackup(snoozeBackup: Date) {
    if (isAfter(new Date(), snoozeBackup)) {
      const backupMnemonic = Array.from(this._wallets.values()).find(
        w => !w.mnemonicSaved && !w.isHidden,
      );

      if (backupMnemonic) {
        await sleep(1000);
        this.emit('backupMnemonic', backupMnemonic);
      }
    }
  }

  attachWallet(wallet: Wallet) {
    this._wallets.set(wallet.address, wallet);
  }

  deAttachWallet(wallet: Wallet) {
    this._wallets.delete(wallet.address);
  }

  addWalletFromLedger(
    {
      address,
      deviceId,
      deviceName,
    }: {address: string; deviceId: string; deviceName: string},
    name?: string,
  ): Promise<Wallet | null> {
    return this.addWallet(
      {
        type: WalletType.ledgerBt,
        deviceId,
        deviceName,
        address,
      },
      name,
    );
  }

  async addWalletFromMnemonic(
    mnemonic: string,
    path: string,
    name?: string,
  ): Promise<Wallet | null> {
    const node = await restoreFromMnemonic(mnemonic, path);

    console.log('node', node);
    return this.addWallet(
      {
        address: node.address,
        type: WalletType.mnemonic,
        privateKey: node.privateKey,
        mnemonic: node.mnemonic,
        path: node.path,
        rootAddress: node.rootAddress,
      },
      name,
    );
  }

  async addWalletFromPrivateKey(
    privateKey: string,
    name = '',
  ): Promise<Wallet | null> {
    const node = await restoreFromPrivateKey(privateKey);

    return this.addWallet(
      {
        address: node.address,
        type: WalletType.hot,
        privateKey: node.privateKey,
      },
      name,
    );
  }

  async addWallet(walletParams: AddWalletParams, name = '') {
    try {
      const wallet = await Wallet.create(walletParams, name);

      this.attachWallet(wallet);

      requestAnimationFrame(() => {
        app.emit('addWallet', wallet.address);
      });

      return wallet;
    } catch (e) {
      captureException(e, 'createWallet');
    }

    return null;
  }

  async removeWallet(address: string) {
    const wallet = this._wallets.get(address);

    if (wallet) {
      if (wallet.isMain) {
        const wallets = realm
          .objects<WalletRealm>(WalletRealm.schema.name)
          .filtered(`rootAddress = '${wallet.rootAddress}' AND isMain = false`);

        if (wallets.length) {
          const w = new Wallet(wallets[0]);
          w.isMain = true;
        }
      }

      const realmWallet = realm.objectForPrimaryKey<WalletRealm>(
        WalletRealm.schema.name,
        address,
      );

      this.deAttachWallet(wallet);
      if (realmWallet) {
        realm.write(() => {
          realm.delete(realmWallet);
        });
      }
    }

    requestAnimationFrame(() => {
      const realmWallet = realm.objectForPrimaryKey<WalletRealm>(
        WalletRealm.schema.name,
        address,
      );
      if (!realmWallet) {
        app.emit('removeWallet', address);
      }
    });
  }

  clean() {
    this._wallets = new Map();
    this.emit('wallets');
    const wallets = realm.objects<WalletRealm>(WalletRealm.schema.name);

    for (const wallet of wallets) {
      realm.write(() => {
        realm.delete(wallet);
      });
    }
  }

  async updateWalletsData(newPin: string) {
    const oldPin = await app.getPassword();
    for (const wallet of this._wallets.values()) {
      await wallet.updateWalletData(oldPin, newPin);
    }
  }

  getWallet(address: string): Wallet | undefined {
    return this._wallets.get(address);
  }

  getWallets(): Wallet[] {
    return Array.from(this._wallets.values());
  }

  getSize() {
    return this._wallets.size;
  }

  getMain() {
    const wallets = realm.objects<WalletRealm>(WalletRealm.schema.name);
    const main = wallets.filtered('isMain = true');

    if (!main.length) {
      return null;
    }

    return new Wallet(main[0]);
  }

  getForRootAddress(rootAddress: string) {
    const wallets = realm.objects<WalletRealm>(WalletRealm.schema.name);
    return wallets
      .filtered(`rootAddress = '${rootAddress}'`)
      .map(w => new Wallet(w));
  }

  get visible() {
    return Array.from(this._wallets.values()).filter(w => !w.isHidden);
  }

  get addressList(): string[] {
    return Array.from(this._wallets.keys());
  }

  checkBalance() {
    return Promise.all([...this._wallets.values()].map(w => w.checkBalance()));
  }
}

export const wallets = new Wallets();

export const WalletsContext = createContext(wallets);
