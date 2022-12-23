import {app} from '@app/contexts';
import {Events} from '@app/events';
import {Wallet} from '@app/models/wallet';
import {EthNetwork} from '@app/services';

export async function onWalletsBalanceCheck(callback?: () => void) {
  Promise.all(
    Wallet.getAll().map(w => {
      return EthNetwork.getBalance(w.address).then(balance => {
        return [w.address, balance];
      });
    }),
  )
    .then(responses => {
      app.emit(Events.onWalletsBalance, Object.fromEntries(responses));
    })
    .finally(() => {
      callback?.();
    });
}
