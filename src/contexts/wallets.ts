import {createContext, useContext} from 'react';
import {EventEmitter} from 'events';
import {utils} from 'ethers';
import {realm} from '../models';
import {getDefaultNetwork} from '../network';
import {Wallet, WalletType} from '../models/wallet';
import {app} from './app';

class Wallets extends EventEmitter {
  private password: null | string;
  private wallets: Map<string, Wallet>;
  private initialized: boolean = false;

  constructor() {
    super();
    this.wallets = new Map();
    this.password = null;
  }

  async init(): Promise<void> {
    if (this.initialized) {
      return;
    }
    const provider = getDefaultNetwork();
    const wallets = realm.objects<WalletType>('Wallet');

    for (const rawWallet of wallets) {
      try {
        const wallet = await Wallet.fromCache(
          rawWallet,
          provider,
          app.getPassword(),
        );

        console.log(wallet);

        this.wallets.set(wallet.address, wallet);
      } catch (e) {
        if (e instanceof Error) {
          console.log(rawWallet, e.message);
        }
      }
    }

    this.initialized = true;
  }

  async addWalletFromMnemonic(mnemonic: string, name?: string) {
    const provider = getDefaultNetwork();
    const wallet = await Wallet.fromMnemonic(mnemonic, provider);
    wallet.name = name ?? wallet.name;
    this.wallets.set(wallet.address, wallet);

    await this.saveWallet(wallet);
    this.emit('wallets');
  }

  async addWalletFromPrivateKey(privateKey: string) {
    const provider = getDefaultNetwork();
    const wallet = await Wallet.fromPrivateKey(privateKey, provider);

    this.wallets.set(wallet.address, wallet);

    await this.saveWallet(wallet);
    this.emit('wallets');
  }

  async removeWallet(address: string) {
    this.wallets.delete(address);

    const wallets = await realm.objects<WalletType>('Wallet');
    const filtered = wallets.filtered(`address = '${address}'`);
    if (filtered.length > 0) {
      realm.write(() => {
        realm.delete(filtered[0]);
      });
    }
    this.emit('wallets');
  }

  async saveWallet(wallet: Wallet) {
    const serialized = await wallet.serialize(app.getPassword());

    realm.write(() => {
      realm.create('Wallet', serialized);
    });
  }

  async clean() {
    this.wallets = new Map();

    const wallets = await realm.objects<WalletType>('Wallet');

    for (const wallet of wallets) {
      realm.write(() => {
        realm.delete(wallet);
      });
    }
  }

  getWallet(address: string): Wallet | undefined {
    return this.wallets.get(address);
  }

  getWallets(): Wallet[] {
    return Array.from(this.wallets.values());
  }

  async getBalance(address: string) {
    const balance = await getDefaultNetwork().getBalance(address);
    return Number(utils.formatEther(balance));
  }
}

export const wallets = new Wallets();

export const WalletsContext = createContext(wallets);

export function useWallets() {
  const context = useContext(WalletsContext);

  return context;
}
