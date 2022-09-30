import ethers from 'ethers';
import {Wallet as EthersWallet} from '@ethersproject/wallet';
import {Provider, TransactionRequest} from '@ethersproject/abstract-provider';
import {realm} from './index';
import {decrypt, encrypt} from '../passworder';
import {Deferrable} from '@ethersproject/properties';
import {Mnemonic, WalletCardStyle} from '../types';

export class Wallet extends Realm.Object {
  address!: string;
  name!: string;
  data!: string;
  mnemonicSaved!: boolean;
  cardStyle!: WalletCardStyle;
  colorFrom!: string;
  colorTo!: string;
  colorPattern!: string;
  pattern!: string;
  isHidden!: boolean;

  static schema = {
    name: 'Wallet',
    properties: {
      address: 'string',
      name: 'string',
      data: 'string',
      mnemonicSaved: 'bool',
      cardStyle: 'string',
      isHidden: 'bool',
      colorFrom: 'string',
      colorTo: 'string',
      colorPattern: 'string',
      pattern: 'string',
    },
    primaryKey: 'address',
  };

  private _wallet: ethers.Wallet | null = null;
  private _encrypted: boolean = true;
  private _mnemonic: Mnemonic | undefined;

  constructor(realm: Realm, values: Unmanaged<unknown>) {
    super(realm, values);

    this._encrypted = this.data !== '';
  }

  setWallet(wallet: ethers.Wallet) {
    this._wallet = wallet;
  }

  async decrypt(password: string, provider: Provider) {
    try {
      if (this._encrypted) {
        const decrypted = await decrypt(password, this.data);
        const tmp = new EthersWallet(decrypted.privateKey, provider);

        this.setWallet(tmp);
        this._encrypted = false;

        if (decrypted.mnemonic) {
          this._mnemonic = decrypted.mnemonic;
        }
      }
    } catch (e) {
      console.log(e);
    }
  }

  setName(value: string) {
    realm.write(() => {
      this.name = value;
    });
  }

  setMnemonicSaved(value: boolean) {
    realm.write(() => {
      this.mnemonicSaved = value;
    });
  }

  setIsHidden(value: boolean) {
    realm.write(() => {
      this.isHidden = value;
    });
  }

  setCardStyle(
    cardStyle: WalletCardStyle,
    colorFrom: string,
    colorTo: string,
    colorPattern: string,
  ) {
    realm.write(() => {
      this.cardStyle = cardStyle;
      this.colorFrom = cardStyle;
      this.colorTo = colorTo;
      this.colorPattern = colorPattern;
    });
  }

  get isEncrypted() {
    return this._encrypted;
  }

  get mnemonic() {
    if (!this._mnemonic) {
      return '';
    }

    return this._mnemonic.phrase ?? '';
  }

  connect(provider: Provider) {
    if (this._wallet) {
      this._wallet = this._wallet.connect(provider);
    }
  }

  async sendTransaction(transaction: Deferrable<TransactionRequest>) {
    if (this._wallet) {
      return this._wallet.sendTransaction(transaction);
    }
  }

  async updateWalletData(pin: string) {
    const data = this._wallet
      ? await encrypt(pin, {
          privateKey: this._wallet.privateKey,
          mnemonic: this._mnemonic || this._wallet.mnemonic,
        })
      : '';

    realm.write(() => {
      this.data = data;
    });
  }
}
