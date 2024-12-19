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
import {storage} from '@app/services/mmkv';
import {RPCMessage, RPCObserver} from '@app/types/rpc';
import {deepClone} from '@app/utils';
import {
  ETH_COIN_TYPE,
  STORE_REHYDRATION_TIMEOUT_MS,
  TRON_COIN_TYPE,
  ZERO_HEX_NUMBER,
} from '@app/variables/common';

import {BalanceDataJson, BalanceModel} from './balance.model';
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
import {AppStore} from '../app';
import {Currencies} from '../currencies';
import {ALL_NETWORKS_ID, Provider, ProviderModel} from '../provider';
import {Token} from '../tokens';

type TBalances = Record<ChainId, Record<AddressEthereum, BalanceModel>>;
type TBalancesSerialized = Record<
  ChainId,
  Record<AddressEthereum, BalanceDataJson>
>;

const logger = Logger.create('WalletStore');

class WalletStore implements RPCObserver {
  wallets: WalletModel[] = [];

  lastBalanceUpdate: Date = new Date(0);
  balances: TBalances = {};

  constructor(shouldSkipPersisting: boolean = false) {
    makeAutoObservable(this, {}, {autoBind: true});

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
          {
            key: 'balances',
            deserialize: (value: TBalancesSerialized) => {
              try {
                const deserialized: TBalances = {};

                for (const chainId of Object.keys(value)) {
                  const walletsBalances = Object.entries(value[chainId]) as [
                    AddressEthereum,
                    BalanceDataJson,
                  ][];

                  if (!deserialized[chainId]) {
                    deserialized[chainId] = {};
                  }

                  for (const [wallet, balance] of walletsBalances) {
                    deserialized[chainId][wallet] =
                      BalanceModel.fromJSON(balance);
                  }
                }

                return deserialized;
              } catch (err) {
                logger.captureException(err, 'balances deserialize', {value});
                return {};
              }
            },
            serialize: (value: TBalances) => {
              try {
                const serialized: TBalancesSerialized = {};

                for (const chainId of Object.keys(value)) {
                  const walletsBalances = Object.entries(value[chainId]) as [
                    AddressEthereum,
                    BalanceModel,
                  ][];

                  if (!serialized[chainId]) {
                    serialized[chainId] = {};
                  }

                  for (const [wallet, balance] of walletsBalances) {
                    serialized[chainId][wallet] = balance.toJSON();
                  }
                }

                return serialized;
              } catch (err) {
                logger.captureException(err, 'balances serialize', {
                  value,
                });
                return {};
              }
            },
          },
        ],
        storage,
      });
    }
  }

  get isHydrated() {
    return isHydrated(this);
  }

  private _prepareIndexerBalances = (data: IndexerBalance = []) => {
    if (!data?.length) {
      return undefined;
    }

    const TRON_CHAIN_IDS = Provider.getAll()
      .filter(p => p.isTron)
      .map(p => p.ethChainId as ChainId);

    return data.reduce(
      (acc, [address, chain_id, value]) => {
        const isTron = TRON_CHAIN_IDS.includes(chain_id);

        let parsedAddress: string = address;

        if (isTron && address.startsWith('0x')) {
          parsedAddress = AddressUtils.hexToTron(address);
        }

        const wallet = this.getById(parsedAddress)!;
        const ADDRESS_KEY = wallet?.address;
        return {
          ...acc,
          [chain_id]: {
            ...acc[chain_id],
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
  ): IndexerBalanceData | undefined => {
    try {
      const staked = this._prepareIndexerBalances(data.total_staked);
      const vested = this._prepareIndexerBalances(data.vested);
      const available = this._prepareIndexerBalances(data.available);
      const total = this._prepareIndexerBalances(data.total);
      const lock = this._prepareIndexerBalances(data.locked);
      const availableForStake = this._prepareIndexerBalances(
        data.available_for_stake,
      );

      if (!available) {
        return undefined;
      }

      const requestedChains = Object.keys(available);
      const providers = Provider.getAll().filter(
        p =>
          p.id !== ALL_NETWORKS_ID &&
          requestedChains.includes(String(p.ethChainId)),
      );

      return providers.reduce((acc, p) => {
        try {
          return {
            ...acc,
            [p.ethChainId]: {
              ...this.wallets.reduce((ac, w) => {
                try {
                  const ADDRESS_KEY = w.address;
                  const cosmosAddress = AddressUtils.toHaqq(w.address);
                  const unlock = Number(data?.unlock?.[cosmosAddress] ?? 0);
                  const cachedBalances =
                    this.balances?.[p.ethChainId]?.[ADDRESS_KEY] || {};

                  const availableValue =
                    available?.[p.ethChainId]?.[ADDRESS_KEY] ??
                    cachedBalances.available;

                  // for correct balance placrholders work
                  if (!availableValue) {
                    return ac;
                  }

                  const stakedValue =
                    staked?.[p.ethChainId]?.[ADDRESS_KEY] ??
                    cachedBalances.staked ??
                    ZERO_HEX_NUMBER;

                  const vestedValue =
                    vested?.[p.ethChainId]?.[ADDRESS_KEY] ??
                    cachedBalances.vested ??
                    ZERO_HEX_NUMBER;

                  const totalValue =
                    total?.[p.ethChainId]?.[ADDRESS_KEY] ??
                    cachedBalances.total ??
                    ZERO_HEX_NUMBER;

                  const lockedValue =
                    lock?.[p.ethChainId]?.[ADDRESS_KEY] ??
                    cachedBalances.locked ??
                    ZERO_HEX_NUMBER;

                  const availableForStakeValue =
                    availableForStake?.[p.ethChainId]?.[ADDRESS_KEY] ??
                    cachedBalances.availableForStake ??
                    ZERO_HEX_NUMBER;

                  return {
                    ...ac,
                    [ADDRESS_KEY]: new BalanceModel({
                      staked: new Balance(stakedValue, p.decimals, p.denom),
                      vested: new Balance(vestedValue, p.decimals, p.denom),
                      available: new Balance(
                        availableValue,
                        p.decimals,
                        p.denom,
                      ),
                      total: new Balance(totalValue, p.decimals, p.denom),
                      locked: new Balance(lockedValue, p.decimals, p.denom),
                      availableForStake: new Balance(
                        availableForStakeValue,
                        p.decimals,
                        p.denom,
                      ),
                      unlock: new Date(unlock),
                    }),
                  };
                } catch (err) {
                  logger.error(
                    'parseIndexerBalances 1',
                    err,
                    JSON.stringify({data, ac, acc, w}, null, 2),
                  );
                  return ac;
                }
              }, {}),
            },
          };
        } catch (err) {
          logger.error(
            'parseIndexerBalances 2',
            err,
            JSON.stringify({data, acc, p}, null, 2),
          );
          return acc;
        }
      }, {});
    } catch (err) {
      logger.error('parseIndexerBalances 3', err, data);
      return undefined;
    }
  };

  fetchBalances = async (
    indexerUpdates?: IndexerUpdatesResponse,
    forceUpdateRates = false,
  ) => {
    try {
      if (!AppStore.isOnboarded) {
        return;
      }

      // Request rates based on current currency
      await when(() => this.isHydrated, {
        timeout: STORE_REHYDRATION_TIMEOUT_MS,
      });

      let updates = deepClone(indexerUpdates);
      if (!updates) {
        let addresses = this.getAllVisible().map(w => w.address);
        updates = await Indexer.instance.updates(
          addresses,
          this.lastBalanceUpdate,
        );
      }

      const newBalances = this.parseIndexerBalances(updates);
      runInAction(() => {
        if (newBalances) {
          this.lastBalanceUpdate = new Date(updates.last_update);
          this.balances = {...this.balances, ...newBalances};
        }
      });

      Currencies.setRates(updates.rates, forceUpdateRates);
    } catch (err) {
      logger.captureException(err, 'fetchBalances', {
        indexerUpdates,
        forceUpdateRates,
      });
    }
  };

  /**
   * @returns {boolean} true if balance not loaded
   */
  checkWalletBalanceLoading(wallet: WalletModel | null) {
    if (!wallet) {
      return false;
    }
    return !this.getBalances(wallet.address, Provider.selectedProvider, false)
      ?.total;
  }

  private _calculateAllNetworksBalance = (
    address: AddressEthereum,
    useEmptyFallback = true,
  ) => {
    const getBalanceData = (p: ProviderModel) => {
      const balance = this.balances[p.ethChainId]?.[address];

      if (!balance && useEmptyFallback) {
        return BalanceModel.Empty;
      }

      return balance;
    };

    const balanceModel = BalanceModel.Empty;
    let hasEmptyBalance = false;

    Provider.getAllNetworks().forEach(p => {
      const balance = getBalanceData(p);

      if (!balance) {
        hasEmptyBalance = true;
        return;
      }

      const {available, locked, staked, total, vested, availableForStake} =
        balance;

      balanceModel.addStaked(
        Currencies.convert(staked ?? Balance.Empty, p.ethChainId),
      );
      balanceModel.addVested(
        Currencies.convert(vested ?? Balance.Empty, p.ethChainId),
      );
      balanceModel.addAvailable(
        Currencies.convert(available ?? Balance.Empty, p.ethChainId),
      );
      balanceModel.addTotal(
        Currencies.convert(total ?? Balance.Empty, p.ethChainId),
      );
      balanceModel.addLocked(
        Currencies.convert(locked ?? Balance.Empty, p.ethChainId),
      );
      balanceModel.addAvailableForState(
        Currencies.convert(availableForStake ?? Balance.Empty, p.ethChainId),
      );
    });

    if (hasEmptyBalance && !useEmptyFallback) {
      return undefined;
    }

    return balanceModel;
  };

  getBalances = (
    address: string,
    provider = Provider.selectedProvider,
    useEmptyFallback = true, // used for balance placeholders check
  ) => {
    const wallet = this.getById(address);

    if (!wallet) {
      return undefined;
    }

    const ADDRESS_KEY = wallet.address;

    if (provider.id === ALL_NETWORKS_ID) {
      return this._calculateAllNetworksBalance(ADDRESS_KEY, useEmptyFallback);
    }

    const result = this.balances[provider.ethChainId]?.[ADDRESS_KEY];

    if (!result && useEmptyFallback) {
      return BalanceModel.Empty;
    }

    return result;
  };

  getBalancesByAddressList = (
    addresses: IWalletModel[],
    provider = Provider.selectedProvider,
  ): Record<AddressEthereum, BalanceModel> => {
    return addresses.reduce(
      (acc, wallet) => {
        const balance = this.getBalances(wallet.address, provider);
        acc[wallet.address] = balance || BalanceModel.Empty;

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
    return this.getBalances(address, provider)?.[key] ?? Balance.Empty;
  }

  async createWatchOnly(address: string) {
    const watchWallets = this.getForAccount(WalletType.watchOnly);
    return this.create(`Watch Wallet #${watchWallets.length + 1}`, {
      address: AddressUtils.toEth(address),
      tronAddress: AddressUtils.toTron(address),
      type: WalletType.watchOnly,
      accountId: WalletType.watchOnly,
      path: '0',
      isImported: true,
      mnemonicSaved: true,
    });
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
