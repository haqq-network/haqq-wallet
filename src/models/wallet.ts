import {realm} from './index';
import {decrypt, encrypt} from '../passworder';
import {EventEmitter} from 'events';
import {Mnemonic, WalletCardStyle, WalletType} from '../types';
import {captureException} from '../helpers';
import {EthNetwork} from '../services/eth-network';

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
  type!: WalletType;
  deviceId: string | undefined;
  deviceName: string | undefined;

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
      type: 'string',
      deviceId: 'string?',
      deviceName: 'string?',
    },
    primaryKey: 'address',
  };
}

export class Wallet extends EventEmitter {
  private _raw: WalletRealm;
  private _balance: number = 0;
  private _encrypted: boolean;
  private _mnemonic: Mnemonic | undefined;
  private _privateKey: string | undefined;

  constructor(data: WalletRealm) {
    super();

    this._raw = data;

    this._encrypted = data.data !== '';

    const interval = setInterval(this.checkBalance, 6000);

    this.on('checkBalance', this.checkBalance);

    this._raw.addListener((_object, changes) => {
      if (changes.deleted) {
        clearInterval(interval);
      } else {
        this.emit('change');
      }
    });

    this.checkBalance();
  }

  async decrypt(password: string) {
    try {
      if (this._encrypted) {
        const decrypted = await decrypt(password, this._raw.data);
        this._privateKey = decrypted.privateKey;
        this._encrypted = false;

        if (decrypted.mnemonic) {
          this._mnemonic = decrypted.mnemonic;
        }
      }
    } catch (e) {
      captureException(e);
    }
  }

  get address() {
    return this._raw.address;
  }

  get privateKey() {
    return this._privateKey;
  }

  get name() {
    return this._raw.name;
  }

  get type() {
    return this._raw.type;
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

  get deviceId() {
    return this._raw.deviceId;
  }

  get deviceName() {
    return this._raw.deviceName;
  }

  checkBalance = () => {
    EthNetwork.getBalance(this.address).then(balance => {
      this.balance = balance;
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

  async updateWalletData(pin: string) {
    const data = await encrypt(pin, {
      privateKey: this._privateKey,
      mnemonic: this._mnemonic,
    });

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
