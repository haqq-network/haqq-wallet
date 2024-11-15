import {Events} from '@app/events';
import {AppStore} from '@app/models/app';
import {VariablesString} from '@app/models/variables-string';
import {Wallet} from '@app/models/wallet';
import {Web3BrowserSession} from '@app/models/web3-browser-session';
import {Backend} from '@app/services/backend';
import {WalletConnect} from '@app/services/wallet-connect';

import {onAppReset} from './on-app-reset';
import {onWalletReset} from './on-wallet-reset';

export async function onWalletRemove(address: string) {
  try {
    if (!app.onboarded) {
      return;
    }
    WalletConnect.instance.onWalletRemove(address);
    const wallets = Wallet.addressList();

    // last wallet removed
    if (wallets.length === 0) {
      AppStore.isOnboarded = false;
      await onAppReset();
      await onWalletReset();
    }

    const subscription = VariablesString.get('notificationToken');
    if (subscription) {
      await Backend.instance.unsubscribeByTokenAndAddress(
        subscription,
        address,
      );
    }

    const sessions = Web3BrowserSession.getBySelectedAccount(address);
    for (const session of sessions) {
      session.disconnect();
    }
  } catch (e) {
    Logger.captureException(e, Events.onWalletRemove, {
      address: address,
    });
  }
}
