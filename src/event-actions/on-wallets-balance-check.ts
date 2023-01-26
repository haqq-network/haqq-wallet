import {app} from '@app/contexts';
import {Events} from '@app/events';
import {Wallet} from '@app/models/wallet';
import {EthNetwork} from '@app/services';

export async function onWalletsBalanceCheck(callback?: () => void) {
  const responses = await Promise.all(
    Wallet.getAll().map(w =>
      EthNetwork.getBalance(w.address).then(balance => [w.address, balance]),
    ),
  );

  app.emit(Events.onWalletsBalance, Object.fromEntries(responses));

  if (callback) {
    callback?.();
  }
}
