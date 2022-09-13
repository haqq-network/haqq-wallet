import {createContext, useContext, useEffect, useState} from 'react';
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
    console.log(JSON.stringify(wallets));
    const password = await app.getPassword();
    for (const rawWallet of wallets) {
      try {
        const wallet = await Wallet.fromCache(rawWallet, provider, password);
        wallet.saved = true;
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
      }, 1000);
    }

    this.initialized = true;
  }

  async addWalletFromMnemonic(
    mnemonic: string,
    name?: string,
    save: boolean = true,
  ) {
    const provider = getDefaultNetwork();
    const wallet = await Wallet.fromMnemonic(mnemonic, provider);

    wallet.name = name ?? wallet.name;
    wallet.main = this.wallets.size === 0;
    this.wallets.set(wallet.address, wallet);

    if (save) {
      await this.saveWallet(wallet);
    }

    this.emit('wallets');

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

    this.wallets.set(wallet.address, wallet);
    if (save) {
      await this.saveWallet(wallet);
    }
    this.emit('wallets');

    return wallet;
  }

  async removeWallet(address: string) {
    const wallet = this.wallets.get(address);
    this.wallets.delete(address);

    const wallets = await realm.objects<WalletType>('Wallet');
    const filtered = wallets.filtered(`address = '${address}'`);
    if (filtered.length > 0) {
      realm.write(() => {
        realm.delete(filtered[0]);
      });

      this.emit('wallets');
      wallet?.emit('change');
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

export function useWallet(address: string) {
  const [wallet, setWallet] = useState(wallets.getWallet(address));

  useEffect(() => {
    setWallet(wallets.getWallet(address));
  }, [address]);

  useEffect(() => {
    const subscription = () => {
      setWallet(wallets.getWallet(address));
    };

    wallet?.on('change', subscription);

    return () => {
      wallet?.off('change', subscription);
    };
  }, [wallet, address]);

  return wallet;
}
