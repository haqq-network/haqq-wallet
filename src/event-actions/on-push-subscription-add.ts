import {app} from '@app/contexts';
import {Wallet} from '@app/models/wallet';
import {pushNotifications} from '@app/services/push-notifications';

export async function onPushSubscriptionAdd() {
  const user = app.getUser();

  if (!(user && user.subscription)) {
    return;
  }

  const wallets = Wallet.getAll();

  await Promise.all(
    wallets.map(async w => {
      await pushNotifications.subscribeAddress(user.subscription!, w.address);
      w.update({
        subscription: user.subscription,
      });
    }),
  );
}
