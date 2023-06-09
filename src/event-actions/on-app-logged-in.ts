import {Image} from 'react-native';

import {Events} from '@app/events';
import {awaitForEventDone} from '@app/helpers/await-for-event-done';
import {Wallet} from '@app/models/wallet';
import {WalletConnect} from '@app/services/wallet-connect';
import {getPatternName} from '@app/utils';

export async function onAppLoggedIn() {
  const wallets = Wallet.getAllVisible();

  await Promise.all(
    Wallet.getAllVisible().map(w => Image.prefetch(getPatternName(w.pattern))),
  ).catch(err => {
    console.error('onAppLoggedIn Image.prefetch error', err);
  });

  await Promise.all(
    wallets.map(wallet =>
      awaitForEventDone(Events.onTransactionsLoad, wallet.address),
    ),
  );

  await WalletConnect.instance.init();
}
