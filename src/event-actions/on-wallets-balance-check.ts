import {app} from '@app/contexts';
import {VariablesDate} from '@app/models/variables-date';
import {Wallet} from '@app/models/wallet';
import {EthNetwork} from '@app/services';
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

      balances = Object.entries(updates.balances).map(b => [
        Cosmos.bech32ToAddress(b[0]),
        b[1],
      ]);

      VariablesDate.set(
        `indexer_${app.provider.cosmosChainId}`,
        new Date(updates.last_updated),
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

    Logger.log('balances', balances);
    app.onWalletsBalance(Object.fromEntries(balances));
  } catch (e) {
    Logger.error('onWalletsBalanceCheck', e);
  }
}
