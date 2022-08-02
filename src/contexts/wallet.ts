import {createContext, useContext} from 'react';
import {EventEmitter} from 'events';
import {setGenericPassword, getGenericPassword, resetGenericPassword} from 'react-native-keychain';
import {passworder} from '../passworder';
import * as bip39 from '../bip39';
import AsyncStorage from '@react-native-community/async-storage';

class Wallet extends EventEmitter {
  private loaded: boolean;
  private password: null|string;
  private mnemonic: null|string;

  constructor() {
    super();

    this.loaded = false;
    this.mnemonic = null;
    this.password = null;

    this.on('change', this.onChange.bind(this));
  }

  async init(): Promise<string> {
    const creds = await getGenericPassword();
    console.log('creds', creds);
    this.loaded = true;
    if (!creds || !creds.password) {
      return 'login';
    }
    this.password = creds.password;
    const wallet = await AsyncStorage.getItem('wallet');
    const data = await passworder.decrypt(this.password, wallet);
    this.mnemonic = data.mnemonic;
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

  getMnemonicWords() {
    return this.mnemonic?.split(' ') ?? [];
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
