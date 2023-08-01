import {app} from '@app/contexts';
import {Wallet} from '@app/models/wallet';
import {EthNetwork} from '@app/services';

export async function onWalletsBalanceCheck() {
  try {
    const responses = await Promise.all(
      Wallet.getAll().map(w =>
        EthNetwork.getBalance(w.address).then(balance => [w.address, balance]),
      ),
    );

    app.onWalletsBalance(Object.fromEntries(responses));
  } catch (e) {
    Logger.error('onWalletsBalanceCheck', e);
  }
}
