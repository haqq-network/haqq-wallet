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
    console.log('Wallets init');
    if (this.initialized) {
      return;
    }
    console.log('Wallets postinit');
    const provider = getDefaultNetwork();
    console.log('Wallets start');
    const wallets = realm.objects<WalletType>('Wallet');
    console.log('Wallets loaded', JSON.stringify(wallets));
    const password = await app.getPassword();
    for (const rawWallet of wallets) {
      try {
        console.log('Wallets rawWallet', rawWallet);
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
    console.log('Wallets done');
    this.emit('wallets');

    const backupMnemonic = Array.from(this.wallets.values()).find(
      w => !w.mnemonic_saved,
    );
    console.log('Wallets backup');
    if (backupMnemonic) {
      setTimeout(() => {
        this.emit('backupMnemonic', backupMnemonic);
      }, 5000);
    }
    console.log('Wallets finish');
    this.initialized = true;
  }

  async addWalletFromMnemonic(mnemonic: string, name?: string) {
    console.log('addWalletFromMnemonic init');
    const provider = getDefaultNetwork();
    const wallet = await Wallet.fromMnemonic(mnemonic, provider);
    console.log('addWalletFromMnemonic created');

    wallet.name = name ?? wallet.name;
    wallet.main = this.wallets.size === 0;
    this.wallets.set(wallet.address, wallet);

    await this.saveWallet(wallet);
    console.log('addWalletFromMnemonic saved');

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
