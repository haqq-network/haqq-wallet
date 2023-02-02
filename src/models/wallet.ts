import {decrypt} from '@haqq/encryption-react-native';

import {app} from '@app/contexts';
import {Events} from '@app/events';
import {Cosmos} from '@app/services/cosmos';
import {generateFlatColors, generateGradientColors} from '@app/utils';
import {
  CARD_CIRCLE_TOTAL,
  CARD_DEFAULT_STYLE,
  CARD_RHOMBUS_TOTAL,
  DEFAULT_CARD_BACKGROUND,
  DEFAULT_CARD_PATTERN,
  FLAT_PRESETS,
  GRADIENT_PRESETS,
} from '@app/variables/common';

import {
  AddWalletParams,
  WalletCardPattern,
  WalletCardStyle,
  WalletType,
} from '../types';
import {realm} from './index';

export class Wallet extends Realm.Object {
  static schema = {
    name: 'Wallet',
    properties: {
      address: 'string',
      name: {type: 'string', default: ''},
      data: {type: 'string', default: ''},
      mnemonicSaved: {type: 'bool', default: false},
      cardStyle: {type: 'string', default: WalletCardStyle.flat},
      isHidden: {type: 'bool', default: false},
      isMain: {type: 'bool', default: false},
      colorFrom: {type: 'string', default: DEFAULT_CARD_BACKGROUND},
      colorTo: {type: 'string', default: DEFAULT_CARD_BACKGROUND},
      colorPattern: {type: 'string', default: DEFAULT_CARD_PATTERN},
      pattern: {type: 'string', default: CARD_DEFAULT_STYLE},
      type: {type: 'string', default: WalletType.hot},
      path: 'string?',
      deviceId: 'string?',
      rootAddress: 'string?',
      subscription: 'string?',
      version: 'int',
      accountId: 'string?',
    },
    primaryKey: 'address',
  };
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
  path: string | undefined;
  rootAddress: string | undefined;
  subscription: string | null;
  version: number;
  accountId: string | null;

  _cosmosAddress: string = '';

  get cosmosAddress() {
    if (!this._cosmosAddress) {
      this._cosmosAddress = Cosmos.address(this.address);
    }

    return this._cosmosAddress;
  }

  static getAll() {
    return realm.objects<Wallet>(Wallet.schema.name);
  }

  static getAllVisible() {
    return Wallet.getAll().filtered('isHidden != true');
  }

  static getForAccount(accountId: string) {
    return Wallet.getAll().filtered(`accountId = '${accountId.toLowerCase()}'`);
  }

  static getById(id: string) {
    const item = realm.objectForPrimaryKey<Wallet>(Wallet.schema.name, id);

    if (!item) {
      return null;
    }

    return item;
  }

  static async create(
    walletParams: AddWalletParams,
    name = '',
  ): Promise<Wallet | null> {
    const exist = Wallet.getById(walletParams.address);
    if (exist) {
      throw new Error('wallet_already_exists');
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

    const wallets = realm.objects<Wallet>(Wallet.schema.name);
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

    let wallet = null;
    realm.write(() => {
      wallet = realm.create<Wallet>(Wallet.schema.name, {
        data: '',
        address: walletParams.address.toLowerCase(),
        mnemonicSaved: false,
        name: name,
        pattern,
        cardStyle,
        colorFrom: colors[0],
        colorTo: colors[1],
        colorPattern: colors[2],
        type: walletParams.type,
        path: walletParams.path,
        accountId: walletParams.accountId,
        version: 2,
      });
    });

    if (!wallet) {
      throw new Error('wallet_error');
    }

    app.emit(Events.onWalletCreate, wallet);

    return wallet;
  }

  static async remove(address: string) {
    const obj = Wallet.getById(address);

    if (obj) {
      const snapshot = obj.toJSON();

      realm.write(() => {
        realm.delete(obj);
      });

      await new Promise(resolve => {
        app.emit(Events.onWalletRemove, address, snapshot, resolve);
      });
    }
  }

  update(params: Partial<Wallet>) {
    realm.write(() => {
      realm.create(
        Wallet.schema.name,
        {
          ...this.toJSON(),
          ...params,
          address: this.address,
        },
        Realm.UpdateMode.Modified,
      );
    });
  }

  setCardStyle(
    cardStyle: WalletCardStyle,
    colorFrom: string,
    colorTo: string,
    colorPattern: string,
    pattern: string,
  ) {
    realm.write(() => {
      this.cardStyle = cardStyle;
      this.colorFrom = colorFrom;
      this.colorTo = colorTo;
      this.colorPattern = colorPattern;
      this.pattern = pattern;
    });
  }

  async getMnemonic(password: string) {
    const decrypted = await decrypt<{mnemonic: {phrase: string} | string}>(
      password,
      this.data,
    );

    return (
      (typeof decrypted.mnemonic === 'string'
        ? decrypted.mnemonic
        : decrypted.mnemonic.phrase) ?? ''
    );
  }
}
