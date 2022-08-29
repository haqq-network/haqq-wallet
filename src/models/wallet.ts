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
    type: 'string',
  },
  primaryKey: 'address',
};

export enum WalletTypes {
  storage = 'storage',
  ledger = 'ledger',
}

export type WalletType = {
  address: string;
  name: string;
  data: string;
  main: boolean;
  mnemonic_saved: boolean;
  type: WalletTypes;
};

export class Wallet {
  address: string;
  name: string;
  mnemonic_saved: boolean;
  wallet?: ethers.Wallet;
  main: boolean;
  saved: boolean = false;
  type: WalletTypes;

  static async fromMnemonic(mnemonic: string, provider: Provider) {
    const tmp = await EthersWallet.fromMnemonic(mnemonic).connect(provider);

    const wallet = new Wallet({
      address: tmp.address,
      data: '',
      name: '',
      mnemonic_saved: false,
      main: false,
      type: WalletTypes.storage,
    });

    wallet.attach_wallet(tmp);

    return wallet;
  }

  static async fromPrivateKey(privateKey: string, provider: Provider) {
    const tmp = new EthersWallet(privateKey, provider);

    const wallet = new Wallet({
      address: tmp.address,
      data: '',
      name: '',
      mnemonic_saved: true,
      main: false,
      type: WalletTypes.storage,
    });

    wallet.attach_wallet(tmp);

    return wallet;
  }

  static async fromCache(
    data: WalletType,
    provider: Provider,
    password: string,
  ) {
    const wallet = new Wallet(data);

    if (wallet.type === WalletTypes.storage) {
      const decrypted = await decrypt(password, data.data);
      const tmp = decrypted.mnemonic
        ? await EthersWallet.fromMnemonic(decrypted.mnemonic.phrase).connect(
            provider,
          )
        : new EthersWallet(decrypted.privateKey, provider);

      wallet.attach_wallet(tmp);
    }

    wallet.saved = true;

    return wallet;
  }

  constructor(data: WalletType) {
    this.address = data.address;
    this.name = data.name;
    this.mnemonic_saved = data.mnemonic_saved;
    this.main = data.main;
    this.type = data.type;
  }

  attach_wallet(wallet: ethers.Wallet) {
    this.wallet = wallet;
  }

  async serialize(
    password: Bytes | string,
  ): Promise<Record<keyof WalletType, any>> {
    const wallet =
      this.type === WalletTypes.storage && this.wallet
        ? await encrypt(password, {
            privateKey: this.wallet.privateKey,
            mnemonic: this.wallet.mnemonic,
          })
        : '';

    return {
      address: this.address,
      name: this.name,
      data: wallet,
      mnemonic_saved: this.mnemonic_saved,
      main: this.main,
      type: this.type,
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
