import {makeAutoObservable, when} from 'mobx';
import {isHydrated, makePersistable} from 'mobx-persist-store';

import {app} from '@app/contexts';
import {onWalletsBalanceCheckRPC} from '@app/event-actions/on-wallets-balance-check';
import {Events} from '@app/events';
import {AddressUtils} from '@app/helpers/address-utils';
import {awaitForEventDone} from '@app/helpers/await-for-event-done';
import {awaitForRealm} from '@app/helpers/await-for-realm';
import {WalletRealmObject} from '@app/models/realm-object-for-migration';
import {Socket} from '@app/models/socket';
import {storage} from '@app/services/mmkv';
import {RPCMessage, RPCObserver} from '@app/types/rpc';
import {generateFlatColors, generateGradientColors} from '@app/utils';
import {
  CARD_CIRCLE_TOTAL,
  CARD_RHOMBUS_TOTAL,
  FLAT_PRESETS,
  GRADIENT_PRESETS,
  STORE_REHYDRATION_TIMEOUT_MS,
} from '@app/variables/common';

import {getMockWallets, isMockEnabled} from './wallet.mock';

import {
  AddWalletParams,
  HaqqCosmosAddress,
  HaqqEthereumAddress,
  MobXStoreFromRealm,
  WalletCardPattern,
  WalletCardStyle,
  WalletCardStyleT,
  WalletType,
} from '../../types';
import {realm} from '../index';
import {Token} from '../tokens';

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
  isImported?: boolean;
};

class WalletStore implements MobXStoreFromRealm, RPCObserver {
  realmSchemaName = WalletRealmObject.schema.name;
  wallets: Wallet[] = [];

  constructor(shouldSkipPersisting: boolean = false) {
    makeAutoObservable(this);

    when(
      () => Socket.lastMessage.type === 'balance',
      () => this.onMessage(Socket.lastMessage),
    );

    if (!shouldSkipPersisting) {
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
      mnemonicSaved: walletParams.mnemonicSaved || false,
      socialLinkEnabled: walletParams.socialLinkEnabled || false,
      name: existingWallet?.name ?? name,
      pattern,
      cardStyle,
      colorFrom: colors[0],
      colorTo: colors[1],
      colorPattern: colors[2],
      type: walletParams.type,
      path: walletParams.path,
      accountId: walletParams.accountId,
      version: 2,
      isHidden: existingWallet?.isHidden ?? false,
      isMain: existingWallet?.isMain ?? false,
      cosmosAddress: AddressUtils.toHaqq(walletParams.address),
      position: this.getSize(),
    };

    if (existingWallet) {
      this.update(existingWallet.address, {
        ...walletParams,
        name: existingWallet.name,
      });
    } else {
      this.wallets.push(newWallet);
    }

    app.emit(Events.onWalletCreate, newWallet);

    return newWallet;
  }

  getById(id: string = '') {
    return (
      this.wallets.find(wallet => wallet.address === id.toLowerCase()) ?? null
    );
  }

  getSize() {
    return this.wallets.length;
  }

  addressList() {
    return this.wallets.map(
      w => w.address.toLowerCase() as HaqqEthereumAddress,
    );
  }

  addressListAllVisible() {
    return this.wallets
      .filter(w => !w.isHidden)
      .map(w => w.address.toLowerCase() as HaqqEthereumAddress);
  }

  getAll() {
    return this.wallets;
  }

  // returns wallets with positive balance or positive token balance
  getAllPositiveBalance() {
    return this.getAll().filter(wallet => {
      if (wallet.isHidden) {
        return false;
      }
      const balance = app.getAvailableBalance(wallet.address);
      const isPositiveBalance = balance.isPositive();

      const tokens = Token.tokens[wallet.address] || [];
      const isPositiveTokenBalance = tokens.some(
        token => token.value?.isPositive?.(),
      );

      return isPositiveBalance || isPositiveTokenBalance;
    });
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

  count(type: WalletType) {
    return this.wallets.filter(item => item.type === type).length;
  }

  onMessage = (message: RPCMessage) => {
    if (message.type !== 'balance') {
      return;
    }

    onWalletsBalanceCheckRPC(message.data);
  };
}

const instance = new WalletStore(Boolean(process.env.JEST_WORKER_ID));
export {instance as Wallet};
