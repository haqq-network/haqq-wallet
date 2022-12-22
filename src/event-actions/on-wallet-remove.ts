import {Events} from '@app/events';
import {captureException} from '@app/helpers';
import {Wallet} from '@app/models/wallet';
import {pushNotifications} from '@app/services/push-notifications';

export async function onWalletRemove(wallet: Wallet) {
  try {
    if (wallet.subscription) {
      await pushNotifications.unsubscribeAddress(
        wallet.subscription,
        wallet.address,
      );
    }
  } catch (e) {
    captureException(e, Events.onWalletRemove, {
      address: wallet.address,
    });
  }
}
