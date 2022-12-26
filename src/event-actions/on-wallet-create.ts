import {app} from '@app/contexts';
import {Events} from '@app/events';
import {captureException} from '@app/helpers';
import {Wallet} from '@app/models/wallet';
import {EthNetwork} from '@app/services';
import {pushNotifications} from '@app/services/push-notifications';

export async function onWalletCreate(wallet: Wallet) {
  try {
    let subscription = app.notifications;
    if (subscription) {
      await pushNotifications.subscribeAddress(subscription, wallet.address);

      wallet.subscription = subscription;
    }

    EthNetwork.getBalance(wallet.address).then(balance => {
      app.emit(Events.onWalletsBalance, {
        [wallet.address]: balance,
      });
    });
  } catch (e) {
    captureException(e, Events.onWalletCreate, {
      address: wallet.address,
    });
  }
}
