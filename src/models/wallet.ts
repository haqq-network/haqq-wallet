import ethers, {utils} from 'ethers';
import {Wallet as EthersWallet} from '@ethersproject/wallet';
import {Provider, TransactionRequest} from '@ethersproject/abstract-provider';
import {Bytes} from '@ethersproject/bytes';
import {realm} from './index';
import {decrypt, encrypt} from '../passworder';
import {EventEmitter} from 'events';
import {getDefaultNetwork, wsProvider} from '../network';
import {Deferrable} from '@ethersproject/properties';
import {Mnemonic, WalletCardStyle} from '../types';

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
  cardStyle: WalletCardStyle;
  isHidden: boolean;
};

export class Wallet extends EventEmitter {
  address: string;
  name: string;
  mnemonic_saved: boolean;
  wallet: ethers.Wallet | null = null;
  main: boolean;
  saved: boolean = false;
  cardStyle: WalletCardStyle;
  isHidden: boolean = false;
  private _balance: number = 0;
  private _encrypted: string = '';
  private _mnemonic: Mnemonic | undefined;

  static async fromMnemonic(mnemonic: string, provider: Provider) {
    const tmp = await EthersWallet.fromMnemonic(mnemonic).connect(provider);

    const wallet = new Wallet({
      address: tmp.address,
      data: '',
      name: '',
      mnemonic_saved: false,
      main: false,
      cardStyle: WalletCardStyle.defaultGreen,
      isHidden: false,
    });

    wallet.setWallet(tmp);

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
      cardStyle: WalletCardStyle.defaultGreen,
      isHidden: false,
    });

    wallet.setWallet(tmp);

    return wallet;
  }

  static fromCache(data: WalletType) {
    const wallet = new Wallet(data);

    wallet.setEncrypted(data.data);

    return wallet;
  }

  constructor(data: WalletType) {
    super();
    this.address = data.address;
    this.name = data.name;
    this.mnemonic_saved = data.mnemonic_saved;
    this.main = data.main;
    this.isHidden = data.isHidden;
    this.cardStyle = data.cardStyle as WalletCardStyle;

    setInterval(this.checkBalance, 15000);

    this.on('checkBalance', this.checkBalance);

    getDefaultNetwork()
      .getBalance(this.address)
      .then(balance => {
        this.balance = Number(utils.formatEther(balance));
      });
  }

  setWallet(wallet: ethers.Wallet) {
    this.wallet = wallet;
  }

  setEncrypted(encrypted: string) {
    this._encrypted = encrypted;
  }

  async decrypt(password: string, provider: Provider) {
    try {
      if (this._encrypted !== '') {
        const decrypted = await decrypt(password, this._encrypted);
        const tmp = new EthersWallet(decrypted.privateKey, provider);

        this.setWallet(tmp);
        this._encrypted = '';

        if (decrypted.mnemonic) {
          this._mnemonic = decrypted.mnemonic;
        }
      }
    } catch (e) {
      console.log(e);
    }
  }

  get isEncrypted() {
    return this._encrypted !== '';
  }

  checkBalance = () => {
    wsProvider.getBalance(this.address).then(balance => {
      this.balance = Number(utils.formatEther(balance));
    });
  };

  get mnemonic() {
    if (!this._mnemonic) {
      return '';
    }

    return this._mnemonic.phrase ?? '';
  }

  set balance(value: number) {
    this._balance = value;
    this.emit('balance', {balance: this.balance});
  }

  get balance() {
    return this._balance;
  }

  connect(provider: Provider) {
    if (this.wallet) {
      this.wallet = this.wallet.connect(provider);
    }
  }

  async sendTransaction(transaction: Deferrable<TransactionRequest>) {
    if (this.wallet) {
      return this.wallet.sendTransaction(transaction);
    }
  }

  async serialize(
    password: Bytes | string,
  ): Promise<Record<keyof WalletType, any>> {
    const wallet = this.wallet
      ? await encrypt(password, {
          privateKey: this.wallet.privateKey,
          mnemonic: this._mnemonic || this.wallet.mnemonic,
        })
      : '';

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

  async updateWalletData(pin: string) {
    const wallet = this.wallet
      ? await encrypt(pin, {
          privateKey: this.wallet.privateKey,
          mnemonic: this._mnemonic || this.wallet.mnemonic,
        })
      : '';

    const wallets = realm.objects<WalletType>('Wallet');
    const filtered = wallets.filtered(`address = '${this.address}'`);
    if (filtered.length > 0) {
      realm.write(() => {
        filtered[0].data = wallet;
      });
    }
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

      this.emit('change');
    }
  }
}
