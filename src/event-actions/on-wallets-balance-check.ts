import {app} from '@app/contexts';
import {Events} from '@app/events';
import {AddressUtils} from '@app/helpers/address-utils';
import {Currencies} from '@app/models/currencies';
import {ALL_NETWORKS_ID, Provider} from '@app/models/provider';
import {VariablesDate} from '@app/models/variables-date';
import {Wallet} from '@app/models/wallet';
import {Balance} from '@app/services/balance';
import {Indexer, IndexerUpdatesResponse} from '@app/services/indexer';
import {storage} from '@app/services/mmkv';
import {IndexerBalanceData} from '@app/types';
import {createAsyncTask} from '@app/utils';
import {ZERO_HEX_NUMBER} from '@app/variables/common';

const BALANCE_CACHE_KEY = 'balance_storage_indexer';

const parseIndexerBalances = (
  data: IndexerUpdatesResponse,
): IndexerBalanceData => {
  Object.entries(data).forEach(([key, value]) => {
    if (['addresses', 'tokens', 'nfts'].includes(key)) {
      return;
    }

    Object.entries(value).forEach(([key2, value2]) => {
      if (
        AddressUtils.isValidAddress(key2) &&
        !AddressUtils.isHaqqAddress(key2)
      ) {
        // @ts-ignore
        value[AddressUtils.toHaqq(key2)] = value2;
        // @ts-ignore
        delete value[key2];
      }
    });
  });

  const providers = Provider.getAll().filter(p => p.id !== ALL_NETWORKS_ID);
  const wallets = Wallet.getAll();

  return providers.reduce((acc, p) => {
    return {
      ...acc,
      [p.ethChainId]: {
        ...wallets.reduce((ac, w) => {
          const cosmosAddress = AddressUtils.toHaqq(w.address);
          const unlock = Number(data?.unlock?.[cosmosAddress]) ?? 0;

          return {
            ...ac,
            [AddressUtils.toEth(w.address)]: {
              staked: new Balance(
                data?.total_staked?.find?.(
                  ([address, chainId]) =>
                    AddressUtils.equals(w.address, address) &&
                    p.ethChainId === chainId,
                )?.[2] ?? ZERO_HEX_NUMBER,
                p.decimals,
                p.denom,
              ),
              vested: new Balance(
                data?.vested?.find?.(
                  ([address, chainId]) =>
                    AddressUtils.equals(w.address, address) &&
                    p.ethChainId === chainId,
                )?.[2] ?? ZERO_HEX_NUMBER,
                p.decimals,
                p.denom,
              ),
              available: new Balance(
                data?.available?.find?.(
                  ([address, chainId]) =>
                    AddressUtils.equals(w.address, address) &&
                    p.ethChainId === chainId,
                )?.[2] ?? ZERO_HEX_NUMBER,
                p.decimals,
                p.denom,
              ),
              total: new Balance(
                data?.total?.find?.(
                  ([address, chainId]) =>
                    AddressUtils.equals(w.address, address) &&
                    p.ethChainId === chainId,
                )?.[2] ?? ZERO_HEX_NUMBER,
                p.decimals,
                p.denom,
              ),
              locked: new Balance(
                data?.locked?.find?.(
                  ([address, chainId]) =>
                    AddressUtils.equals(w.address, address) &&
                    p.ethChainId === chainId,
                )?.[2] ?? ZERO_HEX_NUMBER,
                p.decimals,
                p.denom,
              ),
              availableForStake: new Balance(
                data?.available_for_stake?.find?.(
                  ([address, chainId]) =>
                    AddressUtils.equals(w.address, address) &&
                    p.ethChainId === chainId,
                )?.[2] ?? ZERO_HEX_NUMBER,
                p.decimals,
                p.denom,
              ),
              unlock: new Date(unlock * 1000),
            },
          };
        }, {}),
      },
    };
  }, {});
};

export const onWalletsBalanceCheck = createAsyncTask(async () => {
  try {
    if (app.onboarded === false) {
      return;
    }
    const wallets = Wallet.getAllVisible();
    const lastBalanceUpdates = VariablesDate.get(
      `indexer_${Provider.selectedProvider.cosmosChainId}`,
    );

    let accounts = wallets.map(w => w.cosmosAddress);
    const updates = await Indexer.instance.updates(
      accounts,
      lastBalanceUpdates,
    );

    VariablesDate.set(
      `indexer_${Provider.selectedProvider.cosmosChainId}`,
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
});

export async function onWalletsBalanceCheckRPC(
  updates: IndexerUpdatesResponse,
) {
  try {
    VariablesDate.set(
      `indexer_${Provider.selectedProvider.cosmosChainId}`,
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
