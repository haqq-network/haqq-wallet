import ethers from 'ethers';
import {Wallet as EthersWallet} from '@ethersproject/wallet';
import {Provider} from '@ethersproject/abstract-provider';
import {Bytes} from '@ethersproject/bytes';
import {realm} from './index';

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
    const tmp = await EthersWallet.fromMnemonic(mnemonic).connect(provider);

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
    const tmp = await EthersWallet.fromEncryptedJson(data.data, password).then(
      w => w.connect(provider),
    );

    return new Wallet(data, tmp);
  }

  constructor(data: WalletType, wallet: ethers.Wallet) {
    this.address = data.address;
    this.name = data.name;
    this.wallet = wallet;
    this.mnemonic_saved = data.mnemonic_saved;
    this.main = data.main;
  }

  encrypt(password: Bytes | string) {
    return this.wallet.encrypt(password);
  }

  async serialize(
    password: Bytes | string,
  ): Promise<Record<keyof WalletType, any>> {
    const wallet = await this.encrypt(password);
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
