import {app} from '@app/contexts';
import {Events} from '@app/events';
import {AddressUtils} from '@app/helpers/address-utils';
import {Currencies} from '@app/models/currencies';
import {VariablesDate} from '@app/models/variables-date';
import {Wallet} from '@app/models/wallet';
import {Balance} from '@app/services/balance';
import {Indexer, IndexerUpdatesResponse} from '@app/services/indexer';
import {storage} from '@app/services/mmkv';
import {IndexerBalanceData} from '@app/types';
import {ZERO_HEX_NUMBER} from '@app/variables/common';

const BALANCE_CACHE_KEY = 'balance_storage_indexer';

const parseIndexerBalances = (
  data: IndexerUpdatesResponse,
): IndexerBalanceData => {
  return Wallet.getAll().reduce((acc, w) => {
    const cosmosAddress = AddressUtils.toHaqq(w.address);
    const staked = data?.total_staked?.[cosmosAddress] ?? ZERO_HEX_NUMBER;
    const vested = data?.vested?.[cosmosAddress] ?? ZERO_HEX_NUMBER;
    const available = data?.available?.[cosmosAddress] ?? ZERO_HEX_NUMBER;
    const total = data?.total?.[cosmosAddress] ?? ZERO_HEX_NUMBER;
    const locked = data?.locked?.[cosmosAddress] ?? ZERO_HEX_NUMBER;
    const availableForStake =
      data?.available_for_stake?.[cosmosAddress] ?? ZERO_HEX_NUMBER;
    const unlock = Number(data?.unlock?.[cosmosAddress]) ?? 0;

    return {
      ...acc,
      [w.address]: {
        staked: new Balance(staked),
        vested: new Balance(vested),
        available: new Balance(available),
        total: new Balance(total),
        locked: new Balance(locked),
        availableForStake: new Balance(availableForStake),
        unlock: new Date(unlock * 1000),
      },
    };
  }, {});
};

export async function onWalletsBalanceCheck() {
  try {
    if (app.onboarded === false) {
      return;
    }
    const wallets = Wallet.getAllVisible();
    const lastBalanceUpdates = VariablesDate.get(
      `indexer_${app.provider.cosmosChainId}`,
    );

    if (!app.provider.indexer) {
      throw new Error('Indexer is not available');
    }

    let accounts = wallets.map(w => w.cosmosAddress);
    const updates = await Indexer.instance.updates(
      accounts,
      lastBalanceUpdates,
      Currencies.selectedCurrency,
    );

    VariablesDate.set(
      `indexer_${app.provider.cosmosChainId}`,
      new Date(updates.last_update),
    );

    const result = parseIndexerBalances(updates);

    //Caching balances
    const value = JSON.stringify(updates);
    storage.setItem(BALANCE_CACHE_KEY, value);

    app.onWalletsBalance(result);

    Currencies.setRates(updates.rates);
    app.emit(Events.onWalletsBalanceCheckError, null);
  } catch (e) {
    Logger.error(Events.onWalletsBalanceCheck, e);
    app.emit(Events.onWalletsBalanceCheckError, e);

    // Trying to find cached balances
    const balancesRaw = storage.getItem(BALANCE_CACHE_KEY) as
      | string
      | undefined;
    if (balancesRaw) {
      const updates = JSON.parse(balancesRaw) as IndexerUpdatesResponse;
      const result = parseIndexerBalances(updates);
      app.onWalletsBalance(result);
    }
  }
}

export async function onWalletsBalanceCheckRPC(
  updates: IndexerUpdatesResponse,
) {
  try {
    VariablesDate.set(
      `indexer_${app.provider.cosmosChainId}`,
      new Date(updates.last_update),
    );

    const result = parseIndexerBalances(updates);

    //Caching balances
    const value = JSON.stringify(updates);
    storage.setItem(BALANCE_CACHE_KEY, value);

    app.onWalletsBalance(result);

    Currencies.setRates(updates.rates);
    app.emit(Events.onWalletsBalanceCheckError, null);
  } catch (e) {
    Logger.error(Events.onWalletsBalanceCheck, e);
    app.emit(Events.onWalletsBalanceCheckError, e);

    // Trying to find cached balances
    const balancesRaw = storage.getItem(BALANCE_CACHE_KEY) as
      | string
      | undefined;
    if (balancesRaw) {
      const _updates = JSON.parse(balancesRaw) as IndexerUpdatesResponse;
      const result = parseIndexerBalances(_updates);
      app.onWalletsBalance(result);
    }
  }
}
