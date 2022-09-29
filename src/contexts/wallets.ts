import {createContext, useContext, useEffect, useState} from 'react';
import {EventEmitter} from 'events';
import {utils} from 'ethers';
import {realm} from '../models';
import {getDefaultNetwork} from '../network';
import {Wallet, WalletType} from '../models/wallet';
import {app} from './app';
import {WalletCardStyle} from '../types';
import {generateFlatColors, generateGradientColors, HSBToHEX} from '../utils';

const cards = [WalletCardStyle.flat, WalletCardStyle.gradient];

class Wallets extends EventEmitter {
  private _wallets: Map<string, Wallet>;
  private _initialized: boolean = false;
  private _visible: Wallet[] = [];

  constructor() {
    super();
    this._wallets = new Map();
    const wallets = realm.objects<WalletType>('Wallet');

    for (const rawWallet of wallets) {
      try {
        const wallet = Wallet.fromCache(rawWallet);
        wallet.saved = true;

        this.attachWallet(wallet);
      } catch (e) {
        if (e instanceof Error) {
          console.log(rawWallet, e.message);
        }
      }
    }
  }

  async init(): Promise<void> {
    if (this._initialized) {
      return;
    }

    this._initialized = true;

    const provider = getDefaultNetwork();
    const password = await app.getPassword();

    await Promise.all(
      Array.from(this._wallets.values())
        .filter(w => w.isEncrypted)
        .map(w => w.decrypt(password, provider)),
    );

    this.onChangeWallet();

    const backupMnemonic = Array.from(this._wallets.values()).find(
      w => !w.mnemonic_saved && !w.isHidden,
    );

    if (backupMnemonic) {
      setTimeout(() => {
        this.emit('backupMnemonic', backupMnemonic);
      }, 1000);
    }
  }

  attachWallet(wallet: Wallet) {
    wallet.addListener('change', this.onChangeWallet);
    this._wallets.set(wallet.address, wallet);
  }

  deAttachWallet(wallet: Wallet) {
    wallet.removeListener('change', this.onChangeWallet);
    this._wallets.delete(wallet.address);
    this.onChangeWallet();
  }

  onChangeWallet = () => {
    this._visible = Array.from(this._wallets.values()).filter(w => !w.isHidden);
    this.emit('wallets');
  };

  async addWalletFromMnemonic(
    mnemonic: string,
    name?: string,
    save: boolean = true,
  ) {
    const provider = getDefaultNetwork();
    const wallet = await Wallet.fromMnemonic(mnemonic, provider);

    wallet.name = name ?? wallet.name;
    wallet.main = this._wallets.size === 0;

    wallet.cardStyle = cards[
      this._wallets.size % cards.length
    ] as WalletCardStyle;

    const colors =
      wallet.cardStyle === WalletCardStyle.flat
        ? generateFlatColors()
        : generateGradientColors();

    wallet.colorFrom = colors[0];
    wallet.colorTo = colors[1];
    wallet.colorPattern = colors[2];

    this.attachWallet(wallet);

    if (save) {
      await this.saveWallet(wallet);
    }

    this.onChangeWallet();

    return wallet;
  }

  async addWalletFromPrivateKey(
    privateKey: string,
    name = '',
    save: boolean = true,
  ) {
    const provider = getDefaultNetwork();
    const wallet = await Wallet.fromPrivateKey(privateKey, provider);

    wallet.name = name;
    wallet.cardStyle = cards[
      this._wallets.size % cards.length
    ] as WalletCardStyle;

    const colors =
      wallet.cardStyle === WalletCardStyle.flat
        ? generateFlatColors()
        : generateGradientColors();

    wallet.colorFrom = colors[0];
    wallet.colorTo = colors[1];
    wallet.colorPattern = colors[2];

    this.attachWallet(wallet);
    if (save) {
      await this.saveWallet(wallet);
    }
    this.onChangeWallet();

    return wallet;
  }

  async removeWallet(address: string) {
    const wallet = this._wallets.get(address);
    if (wallet) {
      const wallets = await realm.objects<WalletType>('Wallet');
      const filtered = wallets.filtered(`address = '${address}'`);
      if (filtered.length > 0) {
        realm.write(() => {
          realm.delete(filtered[0]);
        });

        wallet?.emit('change');
        this.deAttachWallet(wallet);
      }
    }
  }

  async saveWallet(wallet: Wallet) {
    const password = await app.getPassword();
    const serialized = await wallet.serialize(password);

    realm.write(() => {
      realm.create('Wallet', serialized);
    });

    wallet.saved = true;
  }

  async clean() {
    this._wallets = new Map();

    const wallets = await realm.objects<WalletType>('Wallet');

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
    return this._visible;
  }

  async getBalance(address: string) {
    const balance = await getDefaultNetwork().getBalance(address);
    return Number(utils.formatEther(balance));
  }

  get addressList() {
    return Array.from(this._wallets.keys());
  }
}

export const wallets = new Wallets();

export const WalletsContext = createContext(wallets);

export function useWallets() {
  const context = useContext(WalletsContext);

  return context;
}

export function useWallet(address: string) {
  const [_date, setDate] = useState(new Date());

  const wallet = wallets.getWallet(address);

  useEffect(() => {
    setDate(new Date());
  }, [address]);

  useEffect(() => {
    const subscription = () => {
      setDate(new Date());
    };

    wallet?.on('change', subscription);

    return () => {
      wallet?.off('change', subscription);
    };
  }, [wallet, address]);

  return wallet;
}
