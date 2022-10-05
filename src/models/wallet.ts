import ethers, {utils} from 'ethers';
import {Wallet as EthersWallet} from '@ethersproject/wallet';
import {Provider, TransactionRequest} from '@ethersproject/abstract-provider';
import {realm} from './index';
import {decrypt, encrypt} from '../passworder';
import {EventEmitter} from 'events';
import {getDefaultNetwork, wsProvider} from '../network';
import {Deferrable} from '@ethersproject/properties';
import {Mnemonic, WalletCardStyle} from '../types';

export class WalletRealm extends Realm.Object {
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
}

export class Wallet extends EventEmitter {
  private _wallet: ethers.Wallet | null = null;
  private _raw: WalletRealm;
  private _balance: number = 0;
  private _encrypted: boolean;
  private _mnemonic: Mnemonic | undefined;

  constructor(data: WalletRealm) {
    super();

    this._raw = data;
    this._encrypted = data.data !== '';

    const interval = setInterval(this.checkBalance, 15000);

    this.on('checkBalance', this.checkBalance);

    this._raw.addListener((_object, changes) => {
      if (changes.deleted) {
        clearInterval(interval);
      } else {
        this.emit('change');
      }
    });

    getDefaultNetwork()
      .getBalance(this.address)
      .then(balance => {
        this.balance = Number(utils.formatEther(balance));
      });
  }

  setWallet(wallet: ethers.Wallet) {
    this._wallet = wallet;
  }

  async decrypt(password: string, provider: Provider) {
    try {
      if (this._encrypted) {
        const decrypted = await decrypt(password, this._raw.data);
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

  get address() {
    return this._raw.address;
  }

  get name() {
    return this._raw.name;
  }

  set name(value) {
    realm.write(() => {
      this._raw.name = value;
    });
  }

  get mnemonicSaved() {
    if (!this._mnemonic?.phrase) {
      return true;
    }
    return this._raw.mnemonicSaved;
  }

  set mnemonicSaved(value) {
    realm.write(() => {
      this._raw.mnemonicSaved = value;
    });
  }

  get isHidden() {
    return this._raw.isHidden;
  }

  set isHidden(value) {
    realm.write(() => {
      this._raw.isHidden = value;
    });
  }

  get cardStyle() {
    return this._raw.cardStyle as WalletCardStyle;
  }

  setCardStyle(
    cardStyle: WalletCardStyle,
    colorFrom: string,
    colorTo: string,
    colorPattern: string,
    pattern: string,
  ) {
    realm.write(() => {
      this._raw.cardStyle = cardStyle;
      this._raw.colorFrom = colorFrom;
      this._raw.colorTo = colorTo;
      this._raw.colorPattern = colorPattern;
      this._raw.pattern = pattern;
    });
  }

  get colorFrom() {
    return this._raw.colorFrom;
  }

  get colorTo() {
    return this._raw.colorTo;
  }

  get colorPattern() {
    return this._raw.colorPattern;
  }

  get pattern() {
    return this._raw.pattern;
  }

  set pattern(value) {
    realm.write(() => {
      this._raw.pattern = value;
    });
  }

  get isEncrypted() {
    return this._encrypted;
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

    const wallet = realm.objectForPrimaryKey<WalletRealm>(
      'Wallet',
      this.address,
    );
    if (wallet) {
      realm.write(() => {
        wallet.data = data;
      });
    }
  }
}
