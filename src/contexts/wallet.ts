import {createContext, useContext} from 'react';
import {EventEmitter} from 'events';
import {
  setGenericPassword,
  getGenericPassword,
  resetGenericPassword,
} from 'react-native-keychain';
import {passworder} from '../passworder';
import * as bip39 from '../bip39';
import AsyncStorage from '@react-native-community/async-storage';
import {validateMnemonic} from '../bip39';
import {hdkey} from 'ethereumjs-wallet';
import EWallet from 'ethereumjs-wallet';

class Wallet extends EventEmitter {
  private loaded: boolean;
  private password: null | string;
  private mnemonic: null | string;
  private wallets: EWallet[] = [];

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
    const wallet = await AsyncStorage.getItem('wallet');
    const data = await passworder.decrypt(this.password, wallet);
    this.mnemonic = data.mnemonic;

    const hdkey1 = hdkey.fromMasterSeed(
      bip39.mnemonicToSeedSync(this.mnemonic ?? ''),
    );

    const root = hdkey1.derivePath("m/44'/60'/0'/0");

    const child = root.deriveChild(0);

    this.wallets.push(child.getWallet());

    return 'home';
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
    this.generateMnemonic();
  }

  generateMnemonic() {
    this.mnemonic = bip39.generateMnemonic();
    this.emit('change');
  }

  async restoreWallet(password: string, mnemonic: string) {
    if (validateMnemonic(mnemonic)) {
      this.password = password;
      await setGenericPassword('username', this.password);
      this.mnemonic = mnemonic;
      this.emit('change');
      return Promise.resolve();
    }

    return Promise.reject();
  }

  getMnemonicWords() {
    return this.mnemonic?.split(' ') ?? [];
  }

  getSeed() {
    return bip39.mnemonicToSeedSync(this.mnemonic ?? '').toString('hex');
  }

  getWallet(index: number): EWallet {
    return this.wallets[index];
  }

  async onChange() {
    const data = await passworder.encrypt(this.password, {
      mnemonic: this.mnemonic,
    });
    await AsyncStorage.setItem('wallet', data);
  }
}

export const wallet = new Wallet();

export const WalletContext = createContext(wallet);

export function useWallet() {
  const context = useContext(WalletContext);

  return context;
}
