import {app} from '@app/contexts';
import {captureException} from '@app/helpers';
import {Wallet} from '@app/models/wallet';
import {pushNotifications} from '@app/services/push-notifications';

export enum Events {
  onWalletCreate = 'onWalletCreate',
  onWalletRemove = 'onWalletRemove',
  onPushSubscriptionAdd = 'onPushSubscriptionAdd',
  onPushSubscriptionRemove = 'onPushSubscriptionRemove',
}

app.on(Events.onWalletCreate, async (wallet: Wallet) => {
  try {
    let subscription = app.notifications;
    if (subscription) {
      await pushNotifications.subscribeAddress(subscription, wallet.address);

      wallet.subscription = subscription;
    }
  } catch (e) {
    captureException(e, Events.onWalletCreate, {
      address: wallet.address,
    });
  }
});

app.on(Events.onWalletRemove, async (wallet: Wallet) => {
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
});

app.on(Events.onPushSubscriptionAdd, async () => {
  const user = app.getUser();

  if (!(user && user.subscription)) {
    return;
  }

  const wallets = Wallet.getAll();

  await Promise.all(
    wallets.map(async w => {
      await pushNotifications.subscribeAddress(user.subscription!, w.address);
      w.subscription = user.subscription;
    }),
  );
});
