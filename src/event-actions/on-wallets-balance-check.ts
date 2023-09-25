import {app} from '@app/contexts';
import {Events} from '@app/events';
import {VariablesDate} from '@app/models/variables-date';
import {Wallet} from '@app/models/wallet';
import {EthNetwork} from '@app/services';
import {Balance} from '@app/services/balance';
import {Cosmos} from '@app/services/cosmos';
import {Indexer} from '@app/services/indexer';
import {HaqqCosmosAddress} from '@app/types';

export async function onWalletsBalanceCheck() {
  try {
    let balances: [string, Balance][] = [];

    let lastBalanceUpdates = VariablesDate.get(
      `indexer_${app.provider.cosmosChainId}`,
    );

    const wallets = Wallet.getAll();
    try {
      if (!app.provider.indexer) {
        throw new Error('Indexer is not available');
      }

      let accounts = wallets.map(w => Cosmos.addressToBech32(w.address));
      const updates = await Indexer.instance.updates(
        accounts,
        lastBalanceUpdates,
      );

      balances = Object.entries(updates.balance).map(b => {
        return [
          Cosmos.bech32ToAddress(b[0] as HaqqCosmosAddress),
          new Balance(b[1]),
        ];
      });

      VariablesDate.set(
        `indexer_${app.provider.cosmosChainId}`,
        new Date(updates.last_update),
      );
    } catch (e) {
      Logger.error(Events.onWalletsBalanceCheck, e);

      balances = await Promise.all(
        Wallet.getAll().map(w =>
          EthNetwork.getBalance(w.address).then(
            b => [w.address, b] as [string, Balance],
          ),
        ),
      );
    }

    app.onWalletsBalance(Object.fromEntries(balances));
  } catch (e) {
    Logger.error(Events.onWalletsBalanceCheck, e);
  }
}
