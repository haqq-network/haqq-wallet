import {EventEmitter} from 'events';

import {app} from '@app/contexts';
import {decrypt, encrypt} from '@app/passworder';
import {EthNetwork} from '@app/services';
import {Cosmos} from '@app/services/cosmos';
import {TransportHot} from '@app/services/transport-hot';
import {TransportLedger} from '@app/services/transport-ledger';
import {generateFlatColors, generateGradientColors} from '@app/utils';
import {
  CARD_CIRCLE_TOTAL,
  CARD_DEFAULT_STYLE,
  CARD_RHOMBUS_TOTAL,
  DEFAULT_CARD_BACKGROUND,
  DEFAULT_CARD_PATTERN,
  FLAT_PRESETS,
  GRADIENT_PRESETS,
} from '@app/variables';

import {
  AddWalletParams,
  WalletCardPattern,
  WalletCardStyle,
  WalletType,
} from '../types';
import {realm} from './index';

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
  isMain!: boolean;
  type!: WalletType;
  deviceId: string | undefined;
  deviceName: string | undefined;
  path: string | undefined;
  rootAddress: string | undefined;
  publicKey: string | undefined;
  subscription: string | null;

  static schema = {
    name: 'Wallet',
    properties: {
      address: 'string',
      name: 'string',
      data: 'string',
      mnemonicSaved: 'bool',
      cardStyle: 'string',
      isHidden: 'bool',
      isMain: 'bool',
      colorFrom: 'string',
      colorTo: 'string',
      colorPattern: 'string',
      pattern: 'string',
      type: 'string',
      path: 'string?',
      deviceId: 'string?',
      deviceName: 'string?',
      rootAddress: 'string?',
      publicKey: 'string?',
      subscription: 'string?',
    },
    primaryKey: 'address',
  };
}

export class Wallet extends EventEmitter {
  static defaultData = {
    data: '',
    name: '',
    mnemonicSaved: true,
    isHidden: false,
    isMain: false,
    cardStyle: WalletCardStyle.flat,
    colorFrom: DEFAULT_CARD_BACKGROUND,
    colorTo: DEFAULT_CARD_BACKGROUND,
    colorPattern: DEFAULT_CARD_PATTERN,
    pattern: CARD_DEFAULT_STYLE,
    type: WalletType.hot,
    deviceId: undefined,
    deviceName: undefined,
    path: undefined,
    rootAddress: undefined,
    publicKey: undefined,
  };

  _cosmosAddress: string = '';

  static getAll() {
    return realm.objects<WalletRealm>(WalletRealm.schema.name);
  }

  static async create(walletParams: AddWalletParams, name = '') {
    const exist = realm.objectForPrimaryKey<Wallet>(
      'Wallet',
      walletParams.address,
    );
    if (exist) {
      throw new Error('wallet_already_exists');
    }

    let data = '';
    let deviceId: string | undefined;
    let deviceName: string | undefined;
    let path: string | undefined;
    let rootAddress: string | undefined;
    let mnemonicSaved = false;

    switch (walletParams.type) {
      case WalletType.mnemonic:
        {
          const password = await app.getPassword();
          data = await encrypt(password, walletParams);
          path = walletParams.path;
          rootAddress = walletParams.rootAddress;
        }
        break;
      case WalletType.hot:
        {
          const password = await app.getPassword();
          data = await encrypt(password, walletParams);
          mnemonicSaved = true;
        }
        break;
      case WalletType.ledgerBt:
        deviceId = walletParams.deviceId;
        deviceName = walletParams.deviceName;
        mnemonicSaved = true;
        break;
    }

    const cards = Object.keys(WalletCardStyle);
    const cardStyle = cards[
      Math.floor(Math.random() * cards.length)
    ] as WalletCardStyle;

    const patterns = Object.keys(WalletCardPattern);
    const patternVariant =
      patterns[Math.floor(Math.random() * patterns.length)];

    const pattern = `card-${patternVariant}-${Math.floor(
      Math.random() *
        (patternVariant === WalletCardPattern.circle
          ? CARD_CIRCLE_TOTAL
          : CARD_RHOMBUS_TOTAL),
    )}`;

    const wallets = realm.objects<WalletRealm>(WalletRealm.schema.name);
    const usedColors = new Set(wallets.map(w => w.colorFrom));

    let availableColors = (
      cardStyle === WalletCardStyle.flat ? FLAT_PRESETS : GRADIENT_PRESETS
    ).filter(c => !usedColors.has(c[0]));

    let colors = [
      DEFAULT_CARD_BACKGROUND,
      DEFAULT_CARD_BACKGROUND,
      DEFAULT_CARD_PATTERN,
    ];
    if (availableColors.length) {
      colors =
        availableColors[Math.floor(Math.random() * availableColors.length)];
    } else {
      colors =
        cardStyle === WalletCardStyle.flat
          ? generateFlatColors()
          : generateGradientColors();
    }

    let result = null;
    realm.write(() => {
      result = realm.create<WalletRealm>(WalletRealm.schema.name, {
        ...Wallet.defaultData,
        data,
        address: walletParams.address.toLowerCase(),
        mnemonicSaved,
        name: name ?? Wallet.defaultData.name,
        pattern,
        cardStyle,
        colorFrom: colors[0],
        colorTo: colors[1],
        colorPattern: colors[2],
        type: walletParams.type,
        deviceId,
        deviceName,
        path,
        rootAddress: rootAddress?.toLowerCase(),
        publicKey: walletParams.publicKey,
      });
    });

    if (!result) {
      throw new Error('wallet_error');
    }

    let wallet = new Wallet(result);

    app.emit('wallet:create', wallet);

    return wallet;
  }

  private _raw: WalletRealm;
  private _balance: number = 0;

  constructor(data: WalletRealm) {
    super();

    this._raw = data;

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

  get address() {
    return this._raw.address;
  }

  async getPrivateKey(password: string) {
    switch (this.type) {
      case WalletType.hot:
      case WalletType.mnemonic: {
        const decrypted = await decrypt(password, this._raw.data);
        return decrypted.privateKey;
      }
      default:
        throw new Error('wallet_no_pk');
    }
  }

  get name() {
    return this._raw.name;
  }

  get type() {
    return this._raw.type;
  }

  get path() {
    return this._raw.path ?? '';
  }

  get rootAddress() {
    return this._raw.rootAddress ?? '';
  }

  set name(value) {
    realm.write(() => {
      this._raw.name = value;
    });
  }

  get mnemonicSaved() {
    return this._raw.mnemonicSaved;
  }

  set mnemonicSaved(value) {
    realm.write(() => {
      this._raw.mnemonicSaved = value;
    });
  }

  set subscription(subscription) {
    realm.write(() => {
      this._raw.subscription = subscription;
    });
  }

  get subscription() {
    return this._raw.subscription;
  }

  get isHidden() {
    return this._raw.isHidden;
  }

  set isHidden(value) {
    realm.write(() => {
      this._raw.isHidden = value;
    });
  }

  get isMain() {
    return this._raw.isMain;
  }

  set isMain(value) {
    realm.write(() => {
      this._raw.isMain = value;
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

  async getMnemonic(password: string) {
    const decrypted = await decrypt(password, this._raw.data);

    return (
      (typeof decrypted.mnemonic === 'string'
        ? decrypted.mnemonic
        : decrypted.mnemonic.phrase) ?? ''
    );
  }

  set balance(value: number) {
    this._balance = value;
    this.emit('balance', {balance: this.balance});
    app.emit('balance', this.address);
  }

  get balance() {
    return this._balance;
  }

  async updateWalletData(oldPin: string, newPin: string) {
    const decrypted = await decrypt(oldPin, this._raw.data);
    const encrypted = await encrypt(newPin, decrypted);

    const wallet = realm.objectForPrimaryKey<WalletRealm>(
      WalletRealm.schema.name,
      this.address,
    );
    if (wallet) {
      realm.write(() => {
        wallet.data = encrypted;
      });
    }
  }

  get transport() {
    switch (this.type) {
      case WalletType.mnemonic:
      case WalletType.hot:
        return new TransportHot(this);
      case WalletType.ledgerBt:
        return new TransportLedger(this);
      default:
        throw new Error('transport_not_implemented');
    }
  }

  get cosmosAddress() {
    if (!this._cosmosAddress) {
      this._cosmosAddress = Cosmos.address(this._raw.address);
    }

    return this._cosmosAddress;
  }
}
