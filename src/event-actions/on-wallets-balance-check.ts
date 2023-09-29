import {app} from '@app/contexts';
import {Events} from '@app/events';
import {VariablesDate} from '@app/models/variables-date';
import {Wallet} from '@app/models/wallet';
import {Balance} from '@app/services/balance';
import {Cosmos} from '@app/services/cosmos';
import {Indexer, IndexerUpdatesResponse} from '@app/services/indexer';
import {BalanceData, IndexerBalanceData} from '@app/types';
import {ZERO_HEX_NUMBER} from '@app/variables/common';

export const getEmptyBalances = () => {
  return Wallet.getAll().reduce((acc, w) => {
    return {
      ...acc,
      [w.address]: {
        staked: Balance.Empty,
        vested: Balance.Empty,
        available: Balance.Empty,
        total: Balance.Empty,
        locked: Balance.Empty,
        unlock: new Date(0),
      } as BalanceData,
    };
  }, {} as IndexerBalanceData);
};

const parseIndexerBalances = (data: IndexerUpdatesResponse) => {
  return Wallet.getAll().reduce((acc, w) => {
    const cosmosAddress = Cosmos.addressToBech32(w.address);
    const staked = data.staked?.[cosmosAddress] ?? ZERO_HEX_NUMBER;
    const vested = data.vested?.[cosmosAddress] ?? ZERO_HEX_NUMBER;
    const available = data.available?.[cosmosAddress] ?? ZERO_HEX_NUMBER;
    const total = data.total?.[cosmosAddress] ?? ZERO_HEX_NUMBER;
    const locked = data.locked?.[cosmosAddress] ?? ZERO_HEX_NUMBER;
    const avaliableForStake =
      data.available_for_stake?.[cosmosAddress] ?? ZERO_HEX_NUMBER;
    const unlock = Number(data.unlock?.[cosmosAddress]) ?? 0;

    return {
      ...acc,
      [w.address]: {
        staked: new Balance(staked),
        vested: new Balance(vested),
        available: new Balance(available),
        total: new Balance(total),
        locked: new Balance(locked),
        avaliableForStake: new Balance(avaliableForStake),
        unlock: new Date(unlock * 1000),
      } as BalanceData,
    };
  }, {} as IndexerBalanceData);
};

export async function onWalletsBalanceCheck() {
  try {
    const wallets = Wallet.getAll();
    const lastBalanceUpdates = VariablesDate.get(
      `indexer_${app.provider.cosmosChainId}`,
    );

    if (!app.provider.indexer) {
      throw new Error('Indexer is not available');
    }

    let accounts = wallets.map(w => Cosmos.addressToBech32(w.address));
    const updates = await Indexer.instance.updates(
      accounts,
      lastBalanceUpdates,
    );

    VariablesDate.set(
      `indexer_${app.provider.cosmosChainId}`,
      new Date(updates.last_update),
    );
    app.onWalletsBalance(parseIndexerBalances(updates));
  } catch (e) {
    Logger.error(Events.onWalletsBalanceCheck, e);
    app.onWalletsBalance(getEmptyBalances());
  }
}
