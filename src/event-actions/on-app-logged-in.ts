import {app} from '@app/contexts';
import {Events} from '@app/events';
import {awaitForEventDone} from '@app/helpers/await-for-event-done';
import {prefetchBrowserLinkIcons} from '@app/helpers/prefetch-browser-link-icons';
import {prefetchWalletCardImages} from '@app/helpers/prefetch-wallet-card-images';
import {Wallet} from '@app/models/wallet';
import {WalletConnect} from '@app/services/wallet-connect';

/**
 * @description Called when user logged in. Used to prefetch images and load transactions
 */
export async function onAppLoggedIn() {
  prefetchWalletCardImages();
  prefetchBrowserLinkIcons();

  Promise.race(
    Wallet.getAllVisible().map(wallet =>
      awaitForEventDone(Events.onTransactionsLoad, wallet.address),
    ),
  );

  if (app.onboarded) {
    app.emit(Events.onBlockRequestCheck);
    WalletConnect.instance.init();
  }
}
