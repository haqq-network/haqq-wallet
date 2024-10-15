import {makeAutoObservable, when} from 'mobx';
import {isHydrated, makePersistable} from 'mobx-persist-store';

import {app} from '@app/contexts';
import {DEBUG_VARS} from '@app/debug-vars';
import {onWalletsBalanceCheckRPC} from '@app/event-actions/on-wallets-balance-check';
import {Events} from '@app/events';
import {AddressUtils} from '@app/helpers/address-utils';
import {awaitForEventDone} from '@app/helpers/await-for-event-done';
import {awaitForRealm} from '@app/helpers/await-for-realm';
import {Socket} from '@app/models/socket';
import {storage} from '@app/services/mmkv';
import {RPCMessage, RPCObserver} from '@app/types/rpc';
import {STORE_REHYDRATION_TIMEOUT_MS} from '@app/variables/common';

import {BalanceModel} from './balance.model';
import {getMockWallets} from './wallet.mock';
import {WalletModel} from './wallet.model';
import {IWalletModel} from './wallet.types';
import {
  getWalletCardStyle,
  getWalletColors,
  getWalletPattern,
} from './wallet.utils';

import {
  AddWalletParams,
  AddressEthereum,
  ChainId,
  WalletCardStyleT,
  WalletType,
} from '../../types';
import {Token} from '../tokens';

class WalletStore implements RPCObserver {
  wallets: WalletModel[] = [];
  balances: Record<AddressEthereum, Record<ChainId, BalanceModel>> = {};

  constructor(shouldSkipPersisting: boolean = false) {
    makeAutoObservable(this);

    when(
      () => Socket.lastMessage.type === 'balance',
      () => this.onMessage(Socket.lastMessage),
    );

    if (!shouldSkipPersisting) {
      const isMockEnabled =
        __DEV__ &&
        DEBUG_VARS.enableMockWallets &&
        DEBUG_VARS.mockWalletsAddresses.length;

      let originalWallets: IWalletModel[] = [];

      makePersistable(this, {
        name: this.constructor.name,
        properties: [
          {
            key: 'wallets',
            deserialize: value => {
              if (isMockEnabled) {
                originalWallets = value;
                return getMockWallets().map(w => new WalletModel(w));
              }

              return value
                .sort(
                  (a: IWalletModel, b: IWalletModel) => a.position - b.position,
                )
                .map((w: IWalletModel) => new WalletModel(w));
            },
            serialize: value => {
              if (isMockEnabled) {
                return originalWallets;
              }
              return value.map(w => w.model);
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
  };

  async create(
    name = '',
    walletParams: AddWalletParams,
  ): Promise<WalletModel | null> {
    const cardStyle = getWalletCardStyle(walletParams?.cardStyle);
    const pattern = getWalletPattern(walletParams?.pattern);
    const {colorFrom, colorTo, colorPattern} = getWalletColors(
      this.wallets,
      cardStyle,
      {
        colorFrom: walletParams?.colorFrom,
        colorTo: walletParams?.colorTo,
        colorPattern: walletParams?.colorPattern,
      },
    );

    const existingWallet = this.getById(walletParams.address);
    const newWallet = {
      ...existingWallet,
      data: '',
      subscription: existingWallet?.subscription ?? null,
      address: walletParams.address.toLowerCase() as AddressEthereum,
      mnemonicSaved: walletParams.mnemonicSaved || false,
      socialLinkEnabled: walletParams.socialLinkEnabled || false,
      name: existingWallet?.name ?? name,
      pattern,
      cardStyle,
      colorFrom,
      colorTo,
      colorPattern,
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
      this.wallets.push(new WalletModel(newWallet));
    }

    app.emit(Events.onWalletCreate, newWallet);

    return new WalletModel(newWallet);
  }

  getById(id: string = ''): WalletModel | null {
    return (
      this.wallets.find(wallet => AddressUtils.equals(wallet.address, id)) ??
      null
    );
  }

  getSize() {
    return this.wallets.length;
  }

  addressList() {
    return this.wallets.map(w => w.address.toLowerCase() as AddressEthereum);
  }

  addressListAllVisible() {
    return this.wallets
      .filter(w => !w.isHidden)
      .map(w => w.address.toLowerCase() as AddressEthereum);
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

      const tokens = Token.tokens[AddressUtils.toEth(wallet.address)] || [];
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

  update(address: string, params: Partial<IWalletModel>) {
    const wallet = this.getById(address);

    if (wallet) {
      const otherWallets = this.wallets.filter(
        w => !AddressUtils.equals(w.address, address),
      );
      const updatedWallet = new WalletModel({...wallet.model, ...params});
      this.wallets = [...otherWallets, updatedWallet].sort(
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
