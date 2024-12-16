import {when} from 'mobx';

import {app} from '@app/contexts';
import {Events} from '@app/events';
import {prefetchBrowserLinkIcons} from '@app/helpers/prefetch-browser-link-icons';
import {prefetchWalletCardImages} from '@app/helpers/prefetch-wallet-card-images';
import {AppStore} from '@app/models/app';
import {Wallet} from '@app/models/wallet';
import {WalletConnect} from '@app/services/wallet-connect';

/**
 * @description Called when user logged in. Used to prefetch images and load transactions
 */
export async function onAppLoggedIn() {
  prefetchWalletCardImages();
  prefetchBrowserLinkIcons();

  await when(() => Wallet.isHydrated);
  if (AppStore.isOnboarded || Wallet.getAll().length > 0) {
    app.emit(Events.onBlockRequestCheck);
    WalletConnect.instance.init();
  }
}
