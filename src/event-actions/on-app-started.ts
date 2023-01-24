import {app} from '@app/contexts';
import {Events} from '@app/events';
import {Wallet} from '@app/models/wallet';

export async function onAppStarted() {
  const wallets = Wallet.getAllVisible();

  await Promise.all(
    wallets.map(wallet => {
      return new Promise(resolve => {
        app.emit(Events.onTransactionsLoad, wallet.address, resolve);
      });
    }),
  );
}
