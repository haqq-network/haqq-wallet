import {createContext} from 'react';

import {EventEmitter} from 'events';

import {isAfter} from 'date-fns';
import {Image} from 'react-native';

import {app} from './app';

import {captureException} from '../helpers';
import {realm} from '../models';
import {Wallet, WalletRealm} from '../models/wallet';
import {
  restoreFromMnemonic,
  restoreFromPrivateKey,
} from '../services/eth-utils';
import {Mnemonic, WalletType} from '../types';
import {getPatternName, sleep} from '../utils';

type AddWalletParams = {address: string} & (
  | {
      type: WalletType.hot;
      privateKey: string;
      mnemonic?: Mnemonic;
    }
  | {
      type: WalletType.ledgerBt;
      deviceId: string;
      deviceName: string;
    }
);

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

    const password = await app.getPassword();

    await Promise.all(
      Array.from(this._wallets.values())
        .filter(w => w.isEncrypted)
        .map(w => w.decrypt(password)),
    );

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
    name?: string,
  ): Promise<Wallet | null> {
    const node = await restoreFromMnemonic(mnemonic);

    return this.addWallet(
      {
        address: node.address,
        type: WalletType.hot,
        privateKey: node.privateKey,
        mnemonic: node.mnemonic,
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
      if (wallet.isEncrypted) {
        const password = await app.getPassword();
        await wallet.decrypt(password);
      }

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

  async updateWalletsData(pin: string) {
    for (const wallet of this._wallets.values()) {
      await wallet.updateWalletData(pin);
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
