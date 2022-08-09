import {createContext, useContext} from 'react';
import {EventEmitter} from 'events';
import ethers, {utils, Wallet as EthersWallet} from 'ethers';
import * as bip39 from '../bip39';
import {validateMnemonic} from '../bip39';
import {realm} from '../models';
import {getDefaultNetwork} from '../network';
import {Wallet} from '../models/wallet';
import {app} from './app';

class Wallets extends EventEmitter {
  private password: null | string;
  private wallets: Map<string, ethers.Wallet>;
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
    const wallets = await realm.objects<Wallet>('Wallet');

    console.log('pass', app.getPassword());

    for (const rawWallet of wallets) {
      try {
        const wallet = await EthersWallet.fromEncryptedJson(
          rawWallet.data,
          app.getPassword(),
        ).then(w => w.connect(provider));
        this.wallets.set(wallet.address, wallet);
      } catch (e) {
        console.log(rawWallet, e.message);
      }
    }

    this.initialized = true;
  }

  async addWalletFromMnemonic(mnemonic: string) {
    if (validateMnemonic(mnemonic)) {
      const provider = getDefaultNetwork();
      const wallet = await EthersWallet.fromMnemonic(mnemonic).connect(
        provider,
      );

      console.log(wallet);
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
    console.log('saveWallet', app.getPassword());
    const encrypted = await wallet.encrypt(app.getPassword());

    realm.write(() => {
      realm.create('Wallet', {
        address: wallet.address,
        name: 'Account',
        data: encrypted,
      });
    });
  }

  async clean() {
    this.wallets = new Map();

    const wallets = await realm.objects<Wallet>('Wallet');

    for (const wallet of wallets) {
      realm.write(() => {
        realm.delete(wallet);
      });
    }
  }

  generateMnemonic() {
    return bip39.generateMnemonic();
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
