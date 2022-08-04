import {createContext, useContext} from 'react';
import {EventEmitter} from 'events';
import ethers, {Wallet as EthersWallet} from 'ethers';
import {
  getGenericPassword,
  resetGenericPassword,
  setGenericPassword,
} from 'react-native-keychain';
import * as bip39 from '../bip39';
import {validateMnemonic} from '../bip39';
import AsyncStorage from '@react-native-community/async-storage';
import {realm} from '../models';
import {getDefaultNetwork} from '../network';
import {Wallet} from '../models/wallet';

class Wallets extends EventEmitter {
  private loaded: boolean;
  private password: null | string;
  private mnemonic: null | string;
  private wallets: ethers.Wallet[] = [];

  constructor() {
    super();

    this.loaded = false;
    this.mnemonic = null;
    this.password = null;

    this.on('change', this.onChange.bind(this));
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
      );

      wallet.connect(provider);

      this.wallets.push(wallet);
    }

    return 'home';
  }

  async addWalletFromMnemonic(mnemonic: string) {
    if (validateMnemonic(mnemonic) && this.password) {
      const provider = getDefaultNetwork();
      const wallet = await EthersWallet.fromMnemonic(mnemonic).connect(
        provider,
      );

      this.wallets.push(wallet);

      const encrypted = await wallet.encrypt(this.password);

      realm.write(() => {
        realm.create('Wallet', {
          address: wallet.address,
          name: 'Account',
          data: encrypted,
        });
      });
    }
  }

  async clean() {
    this.password = null;
    await resetGenericPassword();
    this.mnemonic = null;
    await AsyncStorage.removeItem('wallet');
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

  getMnemonicWords() {
    return this.mnemonic?.split(' ') ?? [];
  }

  getSeed() {
    return bip39.mnemonicToSeedSync(this.mnemonic ?? '').toString('hex');
  }

  getWallet(index: number): ethers.Wallet {
    return this.wallets[index];
  }

  getWallets() {
    return this.wallets;
  }

  async onChange() {}
}

export const wallet = new Wallets();

export const WalletContext = createContext(wallet);

export function useWallet() {
  const context = useContext(WalletContext);

  return context;
}
