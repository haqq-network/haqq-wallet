import {makeAutoObservable, runInAction, when} from 'mobx';
import {isHydrated, makePersistable} from 'mobx-persist-store';

import {app} from '@app/contexts';
import {DEBUG_VARS} from '@app/debug-vars';
import {Events} from '@app/events';
import {AddressUtils} from '@app/helpers/address-utils';
import {awaitForEventDone} from '@app/helpers/await-for-event-done';
import {Socket} from '@app/models/socket';
import {Balance} from '@app/services/balance';
import {Indexer, IndexerUpdatesResponse} from '@app/services/indexer';
import {RPCMessage, RPCObserver} from '@app/types/rpc';
import {deepClone} from '@app/utils';
import {
  ETH_COIN_TYPE,
  TRON_COIN_TYPE,
  ZERO_HEX_NUMBER,
} from '@app/variables/common';

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
  AddressCosmosHaqq,
  AddressEthereum,
  AddressTron,
  ChainId,
  HexNumber,
  IndexerBalance,
  IndexerBalanceData,
  WalletCardStyleT,
  WalletType,
} from '../../types';
import {Currencies} from '../currencies';
import {ALL_NETWORKS_ID, Provider, ProviderModel} from '../provider';
import {Token} from '../tokens';

class WalletStore implements RPCObserver {
  wallets: WalletModel[] = [];

  lastBalanceUpdate: Date = new Date(0);
  balances: Record<ChainId, Record<AddressEthereum, BalanceModel>> = {};

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
            deserialize: (value: IWalletModel[]) => {
              if (isMockEnabled) {
                originalWallets = value;
                return getMockWallets().map(w => new WalletModel(w));
              }

              return value
                .sort(
                  (a: IWalletModel, b: IWalletModel) => a.position - b.position,
                )
                .map(w => new WalletModel(w));
            },
            serialize: (value: WalletModel[]) => {
              if (isMockEnabled) {
                return originalWallets;
              }
              return value.map(w => w.toJSON());
            },
          },
        ],
      });
    }
  }

  get isHydrated() {
    return isHydrated(this);
  }

  private _prepareIndexerBalances = (data: IndexerBalance) => {
    const TRON_CHAIN_IDS = Provider.getAllNetworks()
      .filter(p => p.isTron)
      .map(p => p.ethChainId as ChainId);

    return data.reduce(
      (acc, [address, chainId, value]) => {
        const isTron = TRON_CHAIN_IDS.includes(chainId);
        let ADDRESS_KEY = '';

        // convert TRX address to ETH address
        if (isTron) {
          const wallet = AddressUtils.getWalletByAddress(address);
          if (wallet) {
            ADDRESS_KEY = wallet.address;
          } else {
            ADDRESS_KEY = address.startsWith('0x')
              ? address
              : AddressUtils.tronToHex(address);
          }
        } else {
          ADDRESS_KEY = AddressUtils.toEth(address);
        }

        return {
          ...acc,
          [chainId]: {
            ...acc[chainId],
            [ADDRESS_KEY]: value,
          },
        };
      },
      {} as {
        [key: ChainId]: {
          [key: AddressEthereum | AddressCosmosHaqq | AddressTron]: HexNumber;
        };
      },
    );
  };

  private parseIndexerBalances = (
    data: IndexerUpdatesResponse,
  ): IndexerBalanceData => {
    const providers = Provider.getAll().filter(p => p.id !== ALL_NETWORKS_ID);

    const staked = this._prepareIndexerBalances(data.total_staked);
    const vested = this._prepareIndexerBalances(data.vested);
    const available = this._prepareIndexerBalances(data.available);
    const total = this._prepareIndexerBalances(data.total);
    const lock = this._prepareIndexerBalances(data.locked);
    const availableForStake = this._prepareIndexerBalances(
      data.available_for_stake,
    );

    return providers.reduce((acc, p) => {
      return {
        ...acc,
        [p.ethChainId]: {
          ...this.wallets.reduce((ac, w) => {
            const cosmosAddress = AddressUtils.toHaqq(w.address);
            const unlock = Number(data?.unlock?.[cosmosAddress]) ?? 0;
            const ADDRESS_KEY = AddressUtils.toEth(w.address);

            return {
              ...ac,
              [ADDRESS_KEY]: new BalanceModel({
                staked: new Balance(
                  staked[p.ethChainId]?.[ADDRESS_KEY] ?? ZERO_HEX_NUMBER,
                  p.decimals,
                  p.denom,
                ),
                vested: new Balance(
                  vested[p.ethChainId]?.[ADDRESS_KEY] ?? ZERO_HEX_NUMBER,
                  p.decimals,
                  p.denom,
                ),
                available: new Balance(
                  available[p.ethChainId]?.[ADDRESS_KEY] ?? ZERO_HEX_NUMBER,
                  p.decimals,
                  p.denom,
                ),
                total: new Balance(
                  total[p.ethChainId]?.[ADDRESS_KEY] ?? ZERO_HEX_NUMBER,
                  p.decimals,
                  p.denom,
                ),
                locked: new Balance(
                  lock[p.ethChainId]?.[ADDRESS_KEY] ?? ZERO_HEX_NUMBER,
                  p.decimals,
                  p.denom,
                ),
                availableForStake: new Balance(
                  availableForStake[p.ethChainId]?.[ADDRESS_KEY] ??
                    ZERO_HEX_NUMBER,
                  p.decimals,
                  p.denom,
                ),
                unlock: new Date(unlock * 1000),
              }),
            };
          }, {}),
        },
      };
    }, {});
  };

  fetchBalances = async (
    indexerUpdates?: IndexerUpdatesResponse,
    forceUpdateRates = false,
  ) => {
    try {
      if (!app.onboarded) {
        return;
      }

      let updates = deepClone(indexerUpdates);
      if (!updates) {
        let addresses = this.getAllVisible().map(w => w.address);
        updates = await Indexer.instance.updates(
          addresses,
          this.lastBalanceUpdate,
        );
      }

      runInAction(() => {
        this.lastBalanceUpdate = new Date(updates.last_update);
        this.balances = this.parseIndexerBalances(updates);
      });

      Currencies.setRates(updates.rates, forceUpdateRates);
    } catch (e) {
      Logger.error('Fetch balances error', e);
    }
  };

  get isBalancesLoading() {
    return !this.isBalancesLoaded;
  }
  get isBalancesLoaded() {
    return (
      Provider.isAllNetworks ||
      Boolean(this.balances[Provider.selectedProvider.ethChainId])
    );
  }

  private _calculateAllNetworksBalance = (address: string) => {
    const getBalanceData = (p: ProviderModel) => {
      const ADDRESS_KEY = p.isTron
        ? AddressUtils.toTron(address)
        : AddressUtils.toEth(address);
      return (
        // @ts-ignore
        this.balances[p.ethChainId]?.[ADDRESS_KEY] ||
        // @ts-ignore
        Balance.emptyBalances[ADDRESS_KEY]
      );
    };

    const balance = new BalanceModel({
      staked: Balance.Empty,
      vested: Balance.Empty,
      available: Balance.Empty,
      total: Balance.Empty,
      locked: Balance.Empty,
      availableForStake: Balance.Empty,
      unlock: new Date(0),
    });

    Provider.getAllNetworks().forEach(p => {
      const {available, locked, staked, total, vested, availableForStake} =
        getBalanceData(p) ?? {};

      balance.addStaked(
        Currencies.convert(staked ?? Balance.Empty, p.ethChainId),
      );
      balance.addVested(
        Currencies.convert(vested ?? Balance.Empty, p.ethChainId),
      );
      balance.addAvailable(
        Currencies.convert(available ?? Balance.Empty, p.ethChainId),
      );
      balance.addTotal(
        Currencies.convert(total ?? Balance.Empty, p.ethChainId),
      );
      balance.addLocked(
        Currencies.convert(locked ?? Balance.Empty, p.ethChainId),
      );
      balance.addAvailableForState(
        Currencies.convert(availableForStake ?? Balance.Empty, p.ethChainId),
      );
    });

    return balance;
  };

  getBalances = (address: string, provider = Provider.selectedProvider) => {
    if (provider.id === ALL_NETWORKS_ID) {
      return this._calculateAllNetworksBalance(address);
    }

    let ADDRESS_KEY = '' as AddressEthereum;

    if (provider.isTron) {
      const wallet = this.getById(address);
      ADDRESS_KEY = wallet?.address ?? AddressUtils.tronToHex(address);
    } else {
      ADDRESS_KEY = AddressUtils.toEth(address);
    }

    return (
      this.balances[provider.ethChainId]?.[ADDRESS_KEY] ||
      Balance.emptyBalances[ADDRESS_KEY]
    );
  };

  getBalancesByAddressList = (
    addresses: IWalletModel[],
    provider = Provider.selectedProvider,
  ): Record<AddressEthereum, BalanceModel> => {
    return addresses.reduce(
      (acc, wallet) => {
        acc[wallet.address] = this.getBalances(wallet.address, provider);
        return acc;
      },
      {} as Record<AddressEthereum, BalanceModel>,
    );
  };

  getBalance(
    address: string,
    key:
      | 'available'
      | 'availableForStake'
      | 'staked'
      | 'vested'
      | 'total'
      | 'locked',
    provider = Provider.selectedProvider,
  ): Balance {
    return this.getBalances(address, provider)[key];
  }

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
    const newWallet = new WalletModel({
      ...existingWallet?.model,
      data: '',
      subscription: existingWallet?.subscription ?? null,
      address: walletParams.address.toLowerCase() as AddressEthereum,
      tronAddress: walletParams.tronAddress || existingWallet?.tronAddress,
      mnemonicSaved: walletParams.mnemonicSaved || false,
      socialLinkEnabled: walletParams.socialLinkEnabled || false,
      name: existingWallet?.name ?? name,
      pattern,
      cardStyle,
      colorFrom,
      colorTo,
      colorPattern,
      type: walletParams.type,
      path: walletParams.path?.replace?.(TRON_COIN_TYPE, ETH_COIN_TYPE)!,
      accountId: walletParams.accountId,
      version: 3,
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
  }

  getById(id: string = '') {
    return (
      this.wallets.find(wallet => {
        if (
          wallet.address.toLowerCase() === id.toLowerCase() ||
          wallet.cosmosAddress.toLowerCase() === id.toLowerCase()
        ) {
          return wallet;
        }

        if (
          !!wallet.tronAddress &&
          wallet.tronAddress.toLowerCase() === id.toLowerCase()
        ) {
          return wallet;
        }

        return null;
      }) ?? null
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
      const balance = this.getBalance(wallet.address, 'available');
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
      await this.fetchBalances();
    }
  }

  update(address: string, params: Partial<IWalletModel>) {
    const wallet = this.getById(address);

    if (wallet) {
      const otherWallets = this.wallets.filter(
        w => !AddressUtils.equals(w.address, address),
      );
      this.wallets = [
        ...otherWallets,
        new WalletModel({...wallet.model, ...params}),
      ].sort((a, b) => a.position - b.position);
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

    this.fetchBalances(message.data);
  };
}

const instance = new WalletStore(Boolean(process.env.JEST_WORKER_ID));
export {instance as Wallet};
