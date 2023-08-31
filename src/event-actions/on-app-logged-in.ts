import {Image} from 'react-native';

import {app} from '@app/contexts';
import {Events} from '@app/events';
import {awaitForEventDone} from '@app/helpers/await-for-event-done';
import {Wallet} from '@app/models/wallet';
import {WalletConnect} from '@app/services/wallet-connect';
import {getPatternName} from '@app/utils';

/**
 * @description Called when user logged in. Used to prefetch images and load transactions
 */
export async function onAppLoggedIn() {
  const wallets = Wallet.getAllVisible();

  await Promise.all(
    Wallet.getAllVisible().map(w => Image.prefetch(getPatternName(w.pattern))),
  ).catch(err => {
    Logger.error('onAppLoggedIn Image.prefetch error', err);
  });

  Promise.race(
    wallets.map(wallet =>
      awaitForEventDone(Events.onTransactionsLoad, wallet.address),
    ),
  );

  if (app.onboarded) {
    await WalletConnect.instance.init();
  }
}
