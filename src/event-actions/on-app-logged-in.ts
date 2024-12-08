import {app} from '@app/contexts';
import {Events} from '@app/events';
import {prefetchBrowserLinkIcons} from '@app/helpers/prefetch-browser-link-icons';
import {prefetchWalletCardImages} from '@app/helpers/prefetch-wallet-card-images';
import {AppStore} from '@app/models/app';
import {WalletConnect} from '@app/services/wallet-connect';

/**
 * @description Called when user logged in. Used to prefetch images and load transactions
 */
export async function onAppLoggedIn() {
  prefetchWalletCardImages();
  prefetchBrowserLinkIcons();

  if (AppStore.isOnboarded) {
    app.emit(Events.onBlockRequestCheck);
    WalletConnect.instance.init();
  }
}
