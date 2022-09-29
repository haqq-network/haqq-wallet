import {createContext, useContext, useEffect, useState} from 'react';
import {EventEmitter} from 'events';
import ethers, {utils} from 'ethers';
import {realm} from '../models';
import {getDefaultNetwork} from '../network';
import {Wallet, WalletRealm, WalletType} from '../models/wallet';
import {app} from './app';
import {WalletCardStyle} from '../types';
import {generateFlatColors, generateGradientColors, sleep} from '../utils';
import {Wallet as EthersWallet} from '@ethersproject/wallet';
import {encrypt} from '../passworder';

const cards = [WalletCardStyle.flat, WalletCardStyle.gradient];

const defaultData = {
  data: '',
  name: '',
  mnemonic_saved: true,
  isHidden: false,
  cardStyle: WalletCardStyle.flat,
  colorFrom: '#03BF77',
  colorTo: '#03BF77',
  colorPattern: '#0DAC6F',
  pattern: 'card-pattern-0',
};

class Wallets extends EventEmitter {
  private _wallets: Map<string, Wallet>;
  private _initialized: boolean = false;
  private _visible: Wallet[] = [];

  constructor() {
    super();
    this._wallets = new Map();
    const wallets = realm.objects<WalletRealm>('Wallet');

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
      w => !w.mnemonicSaved && !w.isHidden,
    );

    if (backupMnemonic) {
      await sleep(1000);
      this.emit('backupMnemonic', backupMnemonic);
    }
  }

  attachWallet(wallet: Wallet) {
    wallet.addListener('change', this.onChangeWallet);
    this._wallets.set(wallet.address, wallet);
    this.onChangeWallet();
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

  async addWalletFromMnemonic(mnemonic: string, name?: string) {
    const provider = getDefaultNetwork();
    const eWallet = EthersWallet.fromMnemonic(mnemonic).connect(provider);

    return this.addWallet(eWallet, name);
  }

  async addWalletFromPrivateKey(privateKey: string, name = '') {
    const provider = getDefaultNetwork();
    const eWallet = new EthersWallet(privateKey, provider);

    return this.addWallet(eWallet, name);
  }

  async addWallet(eWallet: ethers.Wallet, name = '') {
    const password = await app.getPassword();

    const data = await encrypt(password, {
      privateKey: eWallet.privateKey,
      mnemonic: eWallet.mnemonic,
    });

    const cardStyle = cards[
      this._wallets.size % cards.length
    ] as WalletCardStyle;

    const colors =
      cardStyle === WalletCardStyle.flat
        ? generateFlatColors()
        : generateGradientColors();

    let result = null;

    realm.write(() => {
      result = realm.create<WalletRealm>('Wallet', {
        ...defaultData,
        data: data,
        address: eWallet.address,
        mnemonic_saved: !eWallet.mnemonic,
        name: name ?? defaultData.name,
        cardStyle,
        colorFrom: colors[0],
        colorTo: colors[1],
        colorPattern: colors[2],
      });
    });

    if (result) {
      const wallet = new Wallet(result);

      if (wallet.isEncrypted) {
        const provider = getDefaultNetwork();
        await wallet.decrypt(password, provider);
      }
      this.attachWallet(wallet);
      this.onChangeWallet();

      return wallet;
    }

    return null;
  }

  async removeWallet(address: string) {
    const wallet = this._wallets.get(address);
    if (wallet) {
      const realmWallet = realm.objectForPrimaryKey<WalletRealm>(
        'Wallet',
        address,
      );
      if (realmWallet) {
        realm.write(() => {
          realm.delete(realmWallet);
        });

        wallet?.emit('change');
        this.deAttachWallet(wallet);
      }
    }
  }

  async clean() {
    this._wallets = new Map();

    const wallets = await realm.objects<WalletRealm>('Wallet');

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
