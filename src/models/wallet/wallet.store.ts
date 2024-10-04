import {makeAutoObservable, when} from 'mobx';
import {isHydrated, makePersistable} from 'mobx-persist-store';

import {app} from '@app/contexts';
import {onWalletsBalanceCheckRPC} from '@app/event-actions/on-wallets-balance-check';
import {Events} from '@app/events';
import {AddressUtils} from '@app/helpers/address-utils';
import {awaitForEventDone} from '@app/helpers/await-for-event-done';
import {Socket} from '@app/models/socket';
import {storage} from '@app/services/mmkv';
import {RPCMessage, RPCObserver} from '@app/types/rpc';

import {getCardStyle, getColors, getPattern} from './wallet.helpers';
import {deserialize, serialize} from './wallet.mock';
import {WalletModel} from './wallet.model';

import {
  AddWalletParams,
  HaqqEthereumAddress,
  WalletCardStyleT,
  WalletType,
} from '../../types';
import {Token} from '../tokens';

class WalletStore implements RPCObserver {
  wallets: WalletModel[] = [];

  constructor(shouldSkipPersisting: boolean = false) {
    makeAutoObservable(this);

    when(
      () => Socket.lastMessage.type === 'balance',
      () => this.onMessage(Socket.lastMessage),
    );

    if (!shouldSkipPersisting) {
      makePersistable(this, {
        name: this.constructor.name,
        properties: [
          {
            key: 'wallets',
            deserialize,
            serialize,
          },
        ],
        storage,
      });
    }
  }

  get isHydrated() {
    return isHydrated(this);
  }

  create = (
    name: string,
    walletParams: AddWalletParams,
  ): WalletModel | null => {
    const cardStyle = getCardStyle(walletParams?.cardStyle);
    const pattern = getPattern(walletParams?.pattern);
    const {colorFrom, colorTo, colorPattern} = getColors(
      this.wallets,
      cardStyle,
      {
        colorFrom: walletParams?.colorFrom,
        colorTo: walletParams?.colorTo,
        colorPattern: walletParams?.colorPattern,
      },
    );

    const existingWallet = this.getById(walletParams.address);
    const newWallet = new WalletModel({
      ...existingWallet,
      data: '',
      subscription: existingWallet?.subscription ?? null,
      address: walletParams.address.toLowerCase() as HaqqEthereumAddress,
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
    });

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
  };

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

  update(address: string, params: Partial<WalletModel>) {
    const wallet = this.getById(address);

    if (wallet) {
      const otherWallets = this.wallets.filter(
        w => !AddressUtils.equals(w.address, address),
      );
      this.wallets = [
        ...otherWallets,
        // FIXME: Check types. For some reason type check failed here
        // @ts-ignore
        new WalletModel({...wallet, ...params}),
      ].sort((a, b) => a.position - b.position);
    }
  }

  setCardStyle(address: string, params: Partial<WalletCardStyleT>) {
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
