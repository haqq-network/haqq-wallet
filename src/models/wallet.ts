import ethers from 'ethers';
import {Wallet as EthersWallet} from '@ethersproject/wallet';
import {Provider} from '@ethersproject/abstract-provider';
import {Bytes} from '@ethersproject/bytes';
import {realm} from './index';
import {decrypt, encrypt} from '../passworder';

export const WalletSchema = {
  name: 'Wallet',
  properties: {
    address: 'string',
    name: 'string',
    data: 'string',
    mnemonic_saved: 'bool',
    main: 'bool',
  },
  primaryKey: 'address',
};

export type WalletType = {
  address: string;
  name: string;
  data: string;
  main: boolean;
  mnemonic_saved: boolean;
};

export class Wallet {
  address: string;
  name: string;
  mnemonic_saved: boolean;
  wallet: ethers.Wallet;
  main: boolean;

  static async fromMnemonic(mnemonic: string, provider: Provider) {
    console.log('Wallet fromMnemonic init');
    const tmp = await EthersWallet.fromMnemonic(mnemonic).connect(provider);
    console.log('Wallet fromMnemonic generated');

    return new Wallet(
      {
        address: tmp.address,
        data: '',
        name: '',
        mnemonic_saved: false,
        main: false,
      },
      tmp,
    );
  }

  static async fromPrivateKey(privateKey: string, provider: Provider) {
    const tmp = new EthersWallet(privateKey, provider);

    return new Wallet(
      {
        address: tmp.address,
        data: '',
        name: '',
        mnemonic_saved: true,
        main: false,
      },
      tmp,
    );
  }

  static async fromCache(
    data: WalletType,
    provider: Provider,
    password: string,
  ) {
    console.log('Wallet fromCache init');
    const decrypted = await decrypt(password, data.data);
    console.log('Wallet fromCache decrypted');
    const tmp = new EthersWallet(decrypted.privateKey, provider);
    console.log('Wallet fromCache connected');
    return new Wallet(data, tmp);
  }

  constructor(data: WalletType, wallet: ethers.Wallet) {
    this.address = data.address;
    this.name = data.name;
    this.wallet = wallet;
    this.mnemonic_saved = data.mnemonic_saved;
    this.main = data.main;
  }

  async serialize(
    password: Bytes | string,
  ): Promise<Record<keyof WalletType, any>> {
    console.log('Wallet serialize');
    const wallet = await encrypt(password, {
      privateKey: this.wallet.privateKey,
      mnemonic: this.wallet.mnemonic,
    });
    console.log('Wallet serialize encrypted');
    return {
      address: this.address,
      name: this.name,
      data: wallet,
      mnemonic_saved: this.mnemonic_saved,
      main: this.main,
    };
  }

  updateWallet(data: Partial<Pick<WalletType, 'main' | 'mnemonic_saved'>>) {
    const wallets = realm.objects<WalletType>('Wallet');
    const filtered = wallets.filtered(`address = '${this.address}'`);
    if (filtered.length > 0) {
      realm.write(() => {
        filtered[0].main = data.main || filtered[0].main;

        this.main = filtered[0].main;
        filtered[0].mnemonic_saved =
          data.mnemonic_saved || filtered[0].mnemonic_saved;

        this.mnemonic_saved = filtered[0].mnemonic_saved;
      });
    }
  }
}
