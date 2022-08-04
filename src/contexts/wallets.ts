import {createContext, useContext} from 'react';
import {EventEmitter} from 'events';
import ethers, {utils, Wallet as EthersWallet} from 'ethers';
import {
  getGenericPassword,
  resetGenericPassword,
  setGenericPassword,
} from 'react-native-keychain';
import * as bip39 from '../bip39';
import {validateMnemonic} from '../bip39';
import {realm} from '../models';
import {getDefaultNetwork} from '../network';
import {Wallet} from '../models/wallet';

class Wallets extends EventEmitter {
  private loaded: boolean;
  private password: null | string;
  private wallets: Map<string, ethers.Wallet>;

  constructor() {
    super();
    this.wallets = new Map();
    this.loaded = false;
    this.password = null;
  }

  async init(): Promise<string> {
    const creds = await getGenericPassword();
    this.loaded = true;
    if (!creds || !creds.password) {
      return 'login';
    }
    this.password = creds.password;
    const wallets = await realm.objects<Wallet>('Wallet');
    if (wallets.length === 0) {
      return 'login';
    }
    const provider = getDefaultNetwork();

    for (const rawWallet of wallets) {
      const wallet = await EthersWallet.fromEncryptedJson(
        rawWallet.data,
        this.password,
      ).then(w => w.connect(provider));

      this.wallets.set(wallet.address, wallet);
    }

    return 'home';
  }

  async addWalletFromMnemonic(mnemonic: string) {
    if (validateMnemonic(mnemonic) && this.password) {
      const provider = getDefaultNetwork();
      const wallet = await EthersWallet.fromMnemonic(mnemonic).connect(
        provider,
      );

      this.wallets.set(wallet.address, wallet);

      await this.saveWallet(wallet);
      this.emit('wallets');
    }
  }

  async addWalletFromPrivateKey(privateKey: string) {
    const provider = getDefaultNetwork();
    const wallet = new EthersWallet(privateKey, provider);

    this.wallets.set(wallet.address, wallet);

    await this.saveWallet(wallet);
    this.emit('wallets');
  }

  async removeWallet(address: string) {
    this.wallets.delete(address);

    const wallets = await realm.objects<Wallet>('Wallet');
    const filtered = wallets.filtered(`address = '${address}'`);
    if (filtered.length > 0) {
      realm.write(() => {
        realm.delete(filtered[0]);
      });
    }
    this.emit('wallets');
  }

  async saveWallet(wallet: EthersWallet) {
    const encrypted = await wallet.encrypt(this.password!);

    realm.write(() => {
      realm.create('Wallet', {
        address: wallet.address,
        name: 'Account',
        data: encrypted,
      });
    });
  }

  async clean() {
    this.password = null;
    await resetGenericPassword();
  }

  async setPassword(password: string) {
    this.password = password;
    await setGenericPassword('username', this.password);
  }

  generateMnemonic() {
    return bip39.generateMnemonic();
  }

  async restoreWallet(password: string, mnemonic: string) {
    await this.setPassword(password);
    await this.addWalletFromMnemonic(mnemonic);
  }

  getWallet(address: string): ethers.Wallet | undefined {
    return this.wallets.get(address);
  }

  getWallets(): ethers.Wallet[] {
    return Array.from(this.wallets.values());
  }

  async sendTransaction(from: string, to: string, amount: number) {
    const provider = getDefaultNetwork();
    const wallet = this.getWallet(from);
    if (wallet) {
      await wallet.connect(provider);

      const transaction = await wallet.sendTransaction({
        to,
        value: utils.parseEther(amount.toString()),
        chainId: provider.chainId,
      });
      console.log(transaction);
      return transaction;
    }

    return null;
  }
}

export const wallets = new Wallets();

export const WalletsContext = createContext(wallets);

export function useWallets() {
  const context = useContext(WalletsContext);

  return context;
}
