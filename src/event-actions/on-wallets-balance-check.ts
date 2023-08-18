import {app} from '@app/contexts';
import {VariablesDate} from '@app/models/variables-date';
import {Wallet} from '@app/models/wallet';
import {EthNetwork} from '@app/services';
import {Balance} from '@app/services/balance';
import {Cosmos} from '@app/services/cosmos';
import {Indexer} from '@app/services/indexer';

export async function onWalletsBalanceCheck() {
  try {
    let balances = [];

    if (app.provider.indexer) {
      let lastBalanceUpdates = VariablesDate.get(
        `indexer_${app.provider.cosmosChainId}`,
      );

      let accounts = Wallet.getAll().map(w =>
        Cosmos.addressToBech32(w.address),
      );
      const updates = await Indexer.instance.updates(
        accounts,
        lastBalanceUpdates,
      );

      balances = Object.entries(updates.balance).map(b => [
        Cosmos.bech32ToAddress(b[0]),
        new Balance(b[1]),
      ]);

      VariablesDate.set(
        `indexer_${app.provider.cosmosChainId}`,
        new Date(updates.last_update),
      );
    } else {
      balances = await Promise.all(
        Wallet.getAll().map(w =>
          EthNetwork.getBalance(w.address).then(balance => [
            w.address,
            balance,
          ]),
        ),
      );
    }

    app.onWalletsBalance(Object.fromEntries(balances));
  } catch (e) {
    Logger.error('onWalletsBalanceCheck', e);
  }
}
