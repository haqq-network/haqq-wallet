import {makeAutoObservable, when} from 'mobx';
import {isHydrated, makePersistable} from 'mobx-persist-store';

import {app} from '@app/contexts';
import {DEBUG_VARS} from '@app/debug-vars';
import {Events} from '@app/events';
import {AddressUtils} from '@app/helpers/address-utils';
import {awaitForEventDone} from '@app/helpers/await-for-event-done';
import {awaitForRealm} from '@app/helpers/await-for-realm';
import {storage} from '@app/services/mmkv';
import {generateFlatColors, generateGradientColors, makeID} from '@app/utils';
import {
  CARD_CIRCLE_TOTAL,
  CARD_DEFAULT_STYLE,
  CARD_RHOMBUS_TOTAL,
  DEFAULT_CARD_BACKGROUND,
  DEFAULT_CARD_PATTERN,
  FLAT_PRESETS,
  GRADIENT_PRESETS,
  STORE_REHYDRATION_TIMEOUT_MS,
} from '@app/variables/common';

import {realm} from './index';
import {
  AddWalletParams,
  HaqqCosmosAddress,
  HaqqEthereumAddress,
  MobXStoreFromRealm,
  WalletCardPattern,
  WalletCardStyle,
  WalletCardStyleT,
  WalletType,
} from '../types';

export type Wallet = {
  address: HaqqEthereumAddress;
  name: string;
  data: string;
  mnemonicSaved: boolean;
  socialLinkEnabled: boolean;
  cardStyle: WalletCardStyle;
  colorFrom: string;
  colorTo: string;
  colorPattern: string;
  pattern: string;
  isHidden: boolean;
  isMain: boolean;
  type: WalletType;
  deviceId?: string;
  path?: string;
  rootAddress?: string;
  subscription: string | null;
  version: number;
  accountId: string | null;
  cosmosAddress: HaqqCosmosAddress;
  position: number;
};

function getMockWallets(): Wallet[] {
  return DEBUG_VARS.mockWalletsAddresses.map((address, index) => ({
    address: AddressUtils.toEth(address),
    cosmosAddress: AddressUtils.toHaqq(address),
    accountId: makeID(6),
    data: '',
    mnemonicSaved: false,
    socialLinkEnabled: false,
    name: `🔴 DEBUG #${index}`,
    pattern: `card-rhombus-${index + 1}`,
    cardStyle: WalletCardStyle.gradient,
    colorFrom: '#2ebf41',
    colorTo: '#552ebf',
    colorPattern: '#A6A628',
    type: WalletType.hot,
    path: "44'/60'/0'/0/0",
    version: 2,
    isHidden: false,
    isMain: index === 0,
    position: index,
    subscription: null,
  }));
}

export class WalletRealmObject extends Realm.Object {
  static schema = {
    name: 'Wallet',
    properties: {
      address: 'string',
      name: {type: 'string', default: ''},
      data: {type: 'string', default: ''},
      mnemonicSaved: {type: 'bool', default: false},
      socialLinkEnabled: {type: 'bool', default: false},
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
}

class WalletStore implements MobXStoreFromRealm {
  realmSchemaName = WalletRealmObject.schema.name;
  wallets: Wallet[] = [];

  constructor(shouldSkipPersisting: boolean = false) {
    makeAutoObservable(this);

    if (!shouldSkipPersisting) {
      const isMockEnabled =
        __DEV__ &&
        DEBUG_VARS.enableMockWallets &&
        DEBUG_VARS.mockWalletsAddresses.length;

      let originalWallets: Wallet[] = [];

      makePersistable(this, {
        name: this.constructor.name,
        properties: [
          {
            key: 'wallets',
            deserialize: value => {
              if (isMockEnabled) {
                originalWallets = value;
                return getMockWallets();
              }

              return value.sort(
                (a: Wallet, b: Wallet) => a.position - b.position,
              );
            },
            serialize: value => {
              if (isMockEnabled) {
                return originalWallets;
              }
              return value;
            },
          },
        ],
        storage: storage,
      });
    }
  }

  get isHydrated() {
    return isHydrated(this);
  }

  migrate = async () => {
    await awaitForRealm();
    await when(() => this.isHydrated, {
      timeout: STORE_REHYDRATION_TIMEOUT_MS,
    });

    const realmData = realm.objects<Wallet>(this.realmSchemaName);
    if (realmData.length > 0) {
      realmData.forEach(item => {
        this.create(item.name, {
          address: item.address,
          accountId: item.accountId || '',
          path: item.path || '',
          type: item.type,
          pattern: item.pattern,
          cardStyle: item.cardStyle,
        });
        realm.write(() => {
          realm.delete(item);
        });
      });
    }
  };

  async create(
    name = '',
    walletParams: AddWalletParams,
  ): Promise<Wallet | null> {
    const cards = Object.keys(WalletCardStyle);
    const cardStyle =
      walletParams.cardStyle ??
      (cards[Math.floor(Math.random() * cards.length)] as WalletCardStyle);

    const patterns = Object.keys(WalletCardPattern);
    const patternVariant =
      patterns[Math.floor(Math.random() * patterns.length)];

    const pattern =
      walletParams.pattern ??
      `card-${patternVariant}-${Math.floor(
        Math.random() *
          (patternVariant === WalletCardPattern.circle
            ? CARD_CIRCLE_TOTAL
            : CARD_RHOMBUS_TOTAL),
      )}`;

    const usedColors = new Set(this.wallets.map(w => w.colorFrom));

    let availableColors = (
      cardStyle === WalletCardStyle.flat ? FLAT_PRESETS : GRADIENT_PRESETS
    ).filter(c => !usedColors.has(c[0]));

    let colors: string[];

    if (availableColors.length) {
      colors =
        availableColors[Math.floor(Math.random() * availableColors.length)];
    } else {
      colors =
        cardStyle === WalletCardStyle.flat
          ? generateFlatColors()
          : generateGradientColors();
    }

    if (walletParams.colorFrom) {
      colors[0] = walletParams.colorFrom;
    }

    if (walletParams.colorTo) {
      colors[1] = walletParams.colorTo;
    }

    if (walletParams.colorPattern) {
      colors[2] = walletParams.colorPattern;
    }

    const existingWallet = this.getById(walletParams.address);
    const newWallet = {
      ...existingWallet,
      data: '',
      subscription: existingWallet?.subscription ?? null,
      address: walletParams.address.toLowerCase() as HaqqEthereumAddress,
      mnemonicSaved: false,
      socialLinkEnabled: walletParams.socialLinkEnabled || false,
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
      isHidden: false,
      isMain: false,
      cosmosAddress: AddressUtils.toHaqq(walletParams.address),
      position: this.getSize(),
    };

    if (existingWallet) {
      this.update(existingWallet.address, walletParams);
    } else {
      this.wallets.push(newWallet);
    }

    app.emit(Events.onWalletCreate, newWallet);

    return newWallet;
  }

  getById(id: string = '') {
    return this.wallets.find(wallet => wallet.address === id) ?? null;
  }

  getSize() {
    return this.wallets.length;
  }

  addressList() {
    return this.wallets.map(
      w => w.address.toLowerCase() as HaqqEthereumAddress,
    );
  }

  getAll() {
    return this.wallets;
  }

  getAllVisible() {
    return this.wallets.filter(w => !w.isHidden);
  }

  getForAccount(accountId: string) {
    return this.wallets.filter(
      w => w.accountId?.toLowerCase() === accountId.toLowerCase(),
    );
  }

  async remove(address: string) {
    const obj = this.getById(address);
    if (obj) {
      this.wallets = this.wallets.filter(
        w => w.address.toLowerCase() !== address.toLowerCase(),
      );
      await awaitForEventDone(Events.onWalletRemove, address);
    }
  }

  removeAll() {
    this.wallets = [];
  }

  async toggleIsHidden(address: string = '') {
    const wallet = this.getById(address);
    if (wallet) {
      this.update(address, {isHidden: !wallet.isHidden});
      await awaitForEventDone(Events.onWalletVisibilityChange);
    }
  }

  update(address: string, params: Partial<Wallet>) {
    const wallet = this.getById(address);

    if (wallet) {
      const otherWallets = this.wallets.filter(
        w => !AddressUtils.equals(w.address, address),
      );
      this.wallets = [...otherWallets, {...wallet, ...params}].sort(
        (a, b) => a.position - b.position,
      );
    }
  }

  setCardStyle(address: string = '', params: Partial<WalletCardStyleT>) {
    this.update(address, params);
  }
}

const instance = new WalletStore(Boolean(process.env.JEST_WORKER_ID));
export {instance as Wallet};
