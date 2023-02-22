import {createContext} from 'react';

import {EventEmitter} from 'events';

import {Image} from 'react-native';

import {app} from '@app/contexts/app';
import {Events, WalletsEvents} from '@app/events';
import {realm} from '@app/models';
import {Wallet} from '@app/models/wallet';
import {AddWalletParams} from '@app/types';
import {getPatternName} from '@app/utils';

class Wallets extends EventEmitter<WalletsEvents> {
  private _wallets: Map<string, Wallet>;
  private _initialized: boolean = false;

  constructor() {
    super();
    this._wallets = new Map();
    const wallets = realm.objects<Wallet>(Wallet.schema.name);

    wallets.addListener(() => {
      this.emit('wallets');
    });

    for (const rawWallet of wallets) {
      try {
        this.attachWallet(rawWallet);
      } catch (e) {
        if (e instanceof Error) {
          console.log(rawWallet, e.message);
        }
      }
    }
  }

  get visible() {
    return Array.from(this._wallets.values()).filter(w => !w.isHidden);
  }

  get addressList(): string[] {
    return Array.from(this._wallets.keys());
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

    app.emit(Events.onWalletMnemonicCheck, snoozeBackup);
  }

  attachWallet(wallet: Wallet) {
    this._wallets.set(wallet.address.toLowerCase(), wallet);
  }

  deAttachWallet(wallet: Wallet) {
    this._wallets.delete(wallet.address.toLowerCase());
  }

  async addWallet(walletParams: AddWalletParams, name = '') {
    const wallet = await Wallet.create(walletParams, name);

    if (wallet !== null) {
      this.attachWallet(wallet);
    }

    return wallet;
  }

  async removeWallet(address: string) {
    const wallet = Wallet.getById(address);

    if (!wallet) {
      return;
    }

    if (wallet.isMain) {
      const wallets = realm
        .objects<Wallet>(Wallet.schema.name)
        .filtered(`rootAddress = '${wallet.rootAddress}' AND isMain = false`);

      if (wallets.length) {
        const w = wallets[0];
        w.update({isMain: true});
      }
    }

    this.deAttachWallet(wallet);

    await Wallet.remove(address.toLowerCase());
  }

  clean() {
    this._wallets = new Map();
    this.emit('wallets');
    const wallets = realm.objects<Wallet>(Wallet.schema.name);

    for (const wallet of wallets) {
      realm.write(() => {
        realm.delete(wallet);
      });
    }
  }

  getWallets(): Wallet[] {
    return Array.from(this._wallets.values());
  }

  getSize() {
    return this._wallets.size;
  }

  getMain() {
    const wallets = realm.objects<Wallet>(Wallet.schema.name);
    const main = wallets.filtered('isMain = true');

    if (!main.length) {
      return null;
    }

    return main[0];
  }

  getForRootAddress(rootAddress: string) {
    const wallets = realm.objects<Wallet>(Wallet.schema.name);
    return wallets.filtered(`rootAddress = '${rootAddress.toLowerCase()}'`);
  }
}

export const wallets = new Wallets();

export const WalletsContext = createContext(wallets);
