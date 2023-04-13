import {cosmosAddress} from '@haqq/provider-base';

import {app} from '@app/contexts';
import {Wallet} from '@app/models/wallet';
import {PushNotifications} from '@app/services/push-notifications';
import {COSMOS_PREFIX} from '@app/variables/common';

export async function onPushSubscriptionAdd() {
  const user = app.getUser();

  if (!(user && user.subscription)) {
    return;
  }

  const wallets = Wallet.getAll();

  await Promise.all(
    wallets.map(async w => {
      await PushNotifications.instance.createNotificationSubscription(
        user.subscription!,
        cosmosAddress(w.address, COSMOS_PREFIX),
      );
      w.update({
        subscription: user.subscription,
      });
    }),
  );
}
