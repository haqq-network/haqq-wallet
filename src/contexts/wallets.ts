import {createContext, useContext} from 'react';
import {EventEmitter} from 'events';
import {utils} from 'ethers';
import {realm} from '../models';
import {getDefaultNetwork} from '../network';
import {Wallet, WalletType} from '../models/wallet';
import {app} from './app';

class Wallets extends EventEmitter {
  private wallets: Map<string, Wallet> = new Map();
  private main: Wallet | null = null;
  private initialized: boolean = false;

  async init(): Promise<void> {
    if (this.initialized) {
      return;
    }
    const provider = getDefaultNetwork();
    const wallets = realm.objects<WalletType>('Wallet');
    const password = await app.getPassword();
    for (const rawWallet of wallets) {
      try {
        console.log(rawWallet);
        const wallet = await Wallet.fromCache(rawWallet, provider, password);
        this.wallets.set(wallet.address, wallet);

        if (wallet.main) {
          this.main = wallet;
        }
      } catch (e) {
        if (e instanceof Error) {
          console.log(rawWallet, e.message);
        }
      }
    }

    this.emit('wallets');

    const backupMnemonic = Array.from(this.wallets.values()).find(
      w => !w.mnemonic_saved,
    );

    if (backupMnemonic) {
      setTimeout(() => {
        this.emit('backupMnemonic', backupMnemonic);
      }, 5000);
    }

    this.initialized = true;
  }

  async addWalletFromMnemonic(mnemonic: string, name?: string) {
    const provider = getDefaultNetwork();
    const wallet = await Wallet.fromMnemonic(mnemonic, provider);
    wallet.name = name ?? wallet.name;
    wallet.main = this.wallets.size === 0;
    this.wallets.set(wallet.address, wallet);

    await this.saveWallet(wallet);
    this.emit('wallets');

    return wallet;
  }

  async addWalletFromPrivateKey(privateKey: string, name = '') {
    const provider = getDefaultNetwork();
    const wallet = await Wallet.fromPrivateKey(privateKey, provider);
    wallet.name = name;
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
    const password = await app.getPassword();
    const serialized = await wallet.serialize(password);

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

  getMain() {
    return this.main;
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
