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
    cardStyle: 'string',
    isHidden: 'bool',
  },
  primaryKey: 'address',
};

export type WalletType = {
  address: string;
  name: string;
  data: string;
  main: boolean;
  mnemonic_saved: boolean;
  cardStyle: string;
  isHidden: boolean;
};

export enum WalletCardStyle {
  default = 'default',
}

export class Wallet {
  address: string;
  name: string;
  mnemonic_saved: boolean;
  wallet: ethers.Wallet;
  main: boolean;
  saved: boolean = false;
  cardStyle: WalletCardStyle = WalletCardStyle.default;
  isHidden: boolean = false;

  static async fromMnemonic(mnemonic: string, provider: Provider) {
    const tmp = await EthersWallet.fromMnemonic(mnemonic).connect(provider);

    return new Wallet(
      {
        address: tmp.address,
        data: '',
        name: '',
        mnemonic_saved: false,
        main: false,
        cardStyle: WalletCardStyle.default,
        isHidden: false,
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
        cardStyle: WalletCardStyle.default,
        isHidden: false,
      },
      tmp,
    );
  }

  static async fromCache(
    data: WalletType,
    provider: Provider,
    password: string,
  ) {
    const decrypted = await decrypt(password, data.data);
    const tmp = decrypted.mnemonic
      ? await EthersWallet.fromMnemonic(decrypted.mnemonic.phrase).connect(
          provider,
        )
      : new EthersWallet(decrypted.privateKey, provider);
    return new Wallet(data, tmp);
  }

  constructor(data: WalletType, wallet: ethers.Wallet) {
    this.address = data.address;
    this.name = data.name;
    this.wallet = wallet;
    this.mnemonic_saved = data.mnemonic_saved;
    this.main = data.main;
    this.isHidden = data.isHidden;
  }

  async serialize(
    password: Bytes | string,
  ): Promise<Record<keyof WalletType, any>> {
    const wallet = await encrypt(password, {
      privateKey: this.wallet.privateKey,
      mnemonic: this.wallet.mnemonic,
    });

    return {
      address: this.address,
      name: this.name,
      data: wallet,
      mnemonic_saved: this.mnemonic_saved,
      main: this.main,
      cardStyle: this.cardStyle,
      isHidden: this.isHidden,
    };
  }

  updateWallet(
    data: Partial<
      Pick<
        WalletType,
        'main' | 'mnemonic_saved' | 'cardStyle' | 'isHidden' | 'name'
      >
    >,
  ) {
    const wallets = realm.objects<WalletType>('Wallet');
    const filtered = wallets.filtered(`address = '${this.address}'`);
    if (filtered.length > 0) {
      realm.write(() => {
        filtered[0].name = data.name || filtered[0].name;
        this.name = filtered[0].name;

        filtered[0].main = data.main || filtered[0].main;
        this.main = filtered[0].main;

        filtered[0].mnemonic_saved =
          typeof data.mnemonic_saved !== 'undefined'
            ? data.mnemonic_saved
            : filtered[0].mnemonic_saved;

        this.mnemonic_saved = filtered[0].mnemonic_saved;

        filtered[0].cardStyle = data.cardStyle || filtered[0].cardStyle;
        this.cardStyle = filtered[0].cardStyle as WalletCardStyle;

        filtered[0].isHidden =
          typeof data.isHidden !== 'undefined'
            ? data.isHidden
            : filtered[0].isHidden;
        this.isHidden = filtered[0].isHidden;
      });
    }
  }
}
