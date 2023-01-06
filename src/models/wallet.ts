import {ProviderInterface, decrypt, encrypt} from '@haqq/provider-base';

import {app} from '@app/contexts';
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
} from '@app/variables/common';

import {
  AddWalletParams,
  WalletCardPattern,
  WalletCardStyle,
  WalletType,
} from '../types';
import {realm} from './index';

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
      deviceName: 'string?',
      rootAddress: 'string?',
      publicKey: 'string?',
      subscription: 'string?',
    },
    primaryKey: 'address',
  };

  _cosmosAddress: string = '';
  _transport: ProviderInterface | null = null;

  static getAll() {
    return realm.objects<Wallet>(Wallet.schema.name);
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
        path = walletParams.path;
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
        data,
        address: walletParams.address.toLowerCase(),
        mnemonicSaved,
        name: name,
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

    if (!wallet) {
      throw new Error('wallet_error');
    }

    app.emit('wallet:create', wallet);

    return wallet;
  }

  static remove(address: string) {
    const obj = realm.objectForPrimaryKey<Wallet>(Wallet.schema.name, address);

    if (obj) {
      realm.write(() => {
        realm.delete(obj);
      });
    }
  }

  async getPrivateKey() {
    switch (this.type) {
      case WalletType.hot:
      case WalletType.mnemonic: {
        const password = await app.getPassword();
        const decrypted = await decrypt<{privateKey: string}>(
          password,
          this.data,
        );
        return decrypted.privateKey;
      }
      default:
        throw new Error('wallet_no_pk');
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
    const decrypted = await decrypt<{mnemonic: {phrase: string} | string}>(password, this.data);

    return (
      (typeof decrypted.mnemonic === 'string'
        ? decrypted.mnemonic
        : decrypted.mnemonic.phrase) ?? ''
    );
  }

  async updateWalletData(oldPin: string, newPin: string) {
    const decrypted = await decrypt(oldPin, this.data);
    const encrypted = await encrypt(newPin, decrypted);

    const wallet = realm.objectForPrimaryKey<Wallet>(
      Wallet.schema.name,
      this.address,
    );
    if (wallet) {
      realm.write(() => {
        wallet.data = encrypted;
      });
    }
  }

  get transportExists() {
    return !!this._transport;
  }

  get transport(): ProviderInterface {
    if (!this._transport) {
      switch (this.type) {
        case WalletType.mnemonic:
        case WalletType.hot:
          return new TransportHot(this.getAccountData(), {
            cosmosPrefix: 'haqq',
          });
        case WalletType.ledgerBt:
          return new TransportLedger(this.getAccountData(), {
            cosmosPrefix: 'haqq',
          });
        default:
          throw new Error('transport_not_implemented');
      }
    }
    return this._transport;
  }

  get cosmosAddress() {
    if (!this._cosmosAddress) {
      this._cosmosAddress = Cosmos.address(this.address);
    }

    return this._cosmosAddress;
  }

  setPublicKey(publicKey: string) {
    realm.write(() => {
      this.publicKey = publicKey;
    });
  }

  getAccountData() {
    // eslint-disable-next-line consistent-this
    const self = this;
    return {
      get address(): string {
        return self.address;
      },
      get deviceId(): string {
        return self.deviceId ?? '';
      },
      get path(): string {
        return self.path ?? '';
      },
      get publicKey() {
        return self.publicKey ?? '';
      },
      set publicKey(value: string) {
        self.setPublicKey(value);
      },
      getPrivateKey(): Promise<string> {
        return self.getPrivateKey();
      },
    };
  }
}
